import { NextResponse } from "next/server";
import {
  GENDER_OPTIONS,
  US_STATES,
  type GenderOption,
  isAdminEmail,
} from "@/lib/auth-constants";
import {
  hashPassword,
  issueSession,
  sessionPublic,
} from "@/lib/auth";
import { emptyState, newId } from "@/lib/journey";
import { findUserByEmail, updateDb, type UserRecord } from "@/lib/db";
import { normalizeState } from "@/lib/fund";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const confirm = String(body.confirmPassword ?? body.confirm ?? "");
  const displayName = String(body.displayName ?? "").trim();
  const gender = String(body.gender ?? "") as GenderOption;
  const usState = String(body.usState ?? body.state ?? "")
    .trim()
    .toUpperCase();
  const remember = Boolean(body.remember);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }
  if (!displayName) {
    return NextResponse.json({ error: "Display name required" }, { status: 400 });
  }
  if (!GENDER_OPTIONS.some((g) => g.value === gender)) {
    return NextResponse.json({ error: "Gender required" }, { status: 400 });
  }
  if (!US_STATES.some((s) => s.code === usState)) {
    return NextResponse.json({ error: "State required" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  try {
    let created: UserRecord | null = null;
    await updateDb((db) => {
      if (findUserByEmail(db, email)) {
        const err = new Error("An account with this email already exists");
        (err as Error & { status: number }).status = 409;
        throw err;
      }

      let state = emptyState();
      let legacyState = db.legacyState ?? null;
      // Claim prod/legacy Hx for the admin allowlist on first signup
      if (isAdminEmail(email) && legacyState) {
        state = normalizeState(legacyState);
        legacyState = null;
        if (state.profile) {
          state = {
            ...state,
            profile: {
              ...state.profile,
              displayName: state.profile.displayName || displayName,
              email,
            },
          };
        }
      }

      created = {
        id: newId("user"),
        email,
        passwordHash,
        gender,
        usState,
        displayName,
        createdAt: now,
        lastLoginAt: now,
        passwordReset: null,
        state,
      };

      return {
        ...db,
        legacyState,
        users: [...db.users, created],
      };
    });

    if (!created) {
      return NextResponse.json({ error: "Could not create account" }, { status: 500 });
    }

    const user = await issueSession(created, { remember, touchLogin: false });
    return NextResponse.json({
      user: sessionPublic(user),
      claimedLegacy: isAdminEmail(email) && Boolean(user.state.profile || user.state.evenings?.length),
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
