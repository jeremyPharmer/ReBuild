import { emptyState } from "./journey";
import { normalizeState } from "./fund";
import { readDbText, writeDbText, DATA_DIR } from "./storage";
import type { GenderOption } from "./auth-constants";
import type { RebuildState } from "./types";

export { DATA_DIR };
export const DB_PATH = "db.json";

export type PasswordReset = {
  tokenHash: string;
  expiresAt: string;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  pinHash?: string;
  gender: GenderOption;
  usState: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
  passwordReset?: PasswordReset | null;
  /** Per-user journey / fund state */
  state: RebuildState;
};

export type DbRoot = {
  version: 2;
  users: UserRecord[];
  /**
   * Former single-tenant db.json contents awaiting claim by the first
   * admin signup (prod Hx migration).
   */
  legacyState?: RebuildState | null;
};

function isLegacyState(raw: unknown): raw is RebuildState {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return (
    !("version" in o && o.version === 2 && Array.isArray(o.users)) &&
    ("profile" in o || "mornings" in o || "fund" in o)
  );
}

export function emptyDb(): DbRoot {
  return { version: 2, users: [], legacyState: null };
}

export async function ensureDataDir() {
  // No-op on Vercel KV/Blob; local mkdir handled on write in storage-local.
}

export function normalizeDb(raw: unknown): DbRoot {
  if (isLegacyState(raw)) {
    return {
      version: 2,
      users: [],
      legacyState: normalizeState(raw),
    };
  }
  if (!raw || typeof raw !== "object") return emptyDb();
  const o = raw as Partial<DbRoot>;
  if (o.version === 2 && Array.isArray(o.users)) {
    return {
      version: 2,
      users: o.users.map((u) => ({
        ...u,
        email: String(u.email || "").toLowerCase(),
        state: normalizeState(u.state ?? emptyState()),
      })),
      legacyState: o.legacyState
        ? normalizeState(o.legacyState)
        : o.legacyState === null
          ? null
          : null,
    };
  }
  return emptyDb();
}

export async function readDb(): Promise<DbRoot> {
  try {
    const raw = await readDbText();
    if (!raw) return emptyDb();
    return normalizeDb(JSON.parse(raw) as unknown);
  } catch {
    return emptyDb();
  }
}

export async function writeDb(db: DbRoot): Promise<void> {
  const normalized = normalizeDb(db);
  await writeDbText(JSON.stringify(normalized, null, 2));
}

export async function updateDb(
  fn: (db: DbRoot) => DbRoot | Promise<DbRoot>,
): Promise<DbRoot> {
  const current = await readDb();
  const next = await fn(current);
  await writeDb(next);
  return normalizeDb(next);
}

export function findUserByEmail(
  db: DbRoot,
  email: string,
): UserRecord | undefined {
  const key = email.trim().toLowerCase();
  return db.users.find((u) => u.email === key);
}

export function findUserById(
  db: DbRoot,
  id: string,
): UserRecord | undefined {
  return db.users.find((u) => u.id === id);
}

export function publicUser(u: UserRecord) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    gender: u.gender,
    usState: u.usState,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    hasPin: Boolean(u.pinHash),
    onboarded: Boolean(u.state.profile?.onboarded),
  };
}
