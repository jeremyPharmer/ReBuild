import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isAdminEmail, validatePin } from "./auth-constants";

export { validatePin };
import {
  DEVICE_USER_COOKIE,
  SESSION_COOKIE,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session-token";
import {
  findUserById,
  publicUser,
  readDb,
  updateDb,
  type UserRecord,
} from "./db";

export type { SessionPayload };
export { verifySessionToken, SESSION_COOKIE, DEVICE_USER_COOKIE };

const SESSION_DAYS_DEFAULT = 14;
const SESSION_DAYS_REMEMBER = 180;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 8);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function signSession(
  user: UserRecord,
  remember: boolean,
): Promise<string> {
  const days = remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS_DEFAULT;
  return signSessionToken(
    {
      id: user.id,
      email: user.email,
      onboarded: Boolean(user.state.profile?.onboarded),
    },
    remember,
    days,
  );
}

export async function setSessionCookie(
  token: string,
  remember: boolean,
): Promise<void> {
  const jar = await cookies();
  const days = remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS_DEFAULT;
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function setDeviceUserCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(DEVICE_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS_REMEMBER * 24 * 60 * 60,
  });
}

export async function clearDeviceUserCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(DEVICE_USER_COOKIE);
}

export async function getDeviceUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(DEVICE_USER_COOKIE)?.value ?? null;
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionUser(): Promise<UserRecord | null> {
  const session = await getSessionPayload();
  if (!session) return null;
  const db = await readDb();
  return findUserById(db, session.sub) ?? null;
}

export async function requireSessionUser(): Promise<UserRecord> {
  const user = await getSessionUser();
  if (!user) {
    const err = new Error("Sign in required");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return user;
}

export async function touchLastLogin(userId: string): Promise<UserRecord> {
  const now = new Date().toISOString();
  let updated: UserRecord | null = null;
  await updateDb((db) => ({
    ...db,
    users: db.users.map((u) => {
      if (u.id !== userId) return u;
      updated = { ...u, lastLoginAt: now };
      return updated;
    }),
  }));
  if (!updated) {
    const err = new Error("User not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  return updated;
}

export async function issueSession(
  user: UserRecord,
  opts: { remember?: boolean; touchLogin?: boolean } = {},
): Promise<UserRecord> {
  const remember = Boolean(opts.remember);
  let next = user;
  if (opts.touchLogin !== false) {
    next = await touchLastLogin(user.id);
  }
  const token = await signSession(next, remember);
  await setSessionCookie(token, remember);
  await setDeviceUserCookie(next.id);
  return next;
}

export async function refreshSessionCookie(
  user: UserRecord,
  remember?: boolean,
): Promise<void> {
  const session = await getSessionPayload();
  const flag = remember ?? session?.remember ?? false;
  const token = await signSession(user, flag);
  await setSessionCookie(token, flag);
}

export function sessionPublic(user: UserRecord) {
  return {
    ...publicUser(user),
    isAdmin: isAdminEmail(user.email),
  };
}

export async function hashResetToken(token: string): Promise<string> {
  return bcrypt.hash(token, 8);
}

export async function verifyResetToken(
  token: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
