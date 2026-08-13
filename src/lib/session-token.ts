import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "rebuild_session";
export const DEVICE_USER_COOKIE = "rebuild_device_user";

/** Idle logout window when Remember this device is off. */
export const IDLE_TIMEOUT_SECONDS = 2 * 60 * 60;
export const REMEMBER_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export type SessionPayload = {
  sub: string;
  email: string;
  onboarded: boolean;
  remember: boolean;
};

function authSecret(): Uint8Array {
  const raw =
    process.env.AUTH_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "rebuild-dev-auth-secret-change-me";
  return new TextEncoder().encode(raw);
}

export function sessionMaxAgeSeconds(remember: boolean): number {
  return remember ? REMEMBER_MAX_AGE_SECONDS : IDLE_TIMEOUT_SECONDS;
}

export async function signSessionToken(
  user: { id: string; email: string; onboarded: boolean },
  remember: boolean,
): Promise<string> {
  const maxAge = sessionMaxAgeSeconds(remember);
  return new SignJWT({
    email: user.email,
    onboarded: user.onboarded,
    remember,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(authSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret());
    const sub = String(payload.sub || "");
    if (!sub) return null;
    return {
      sub,
      email: String(payload.email || ""),
      onboarded: Boolean(payload.onboarded),
      remember: Boolean(payload.remember),
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds(remember),
  };
}
