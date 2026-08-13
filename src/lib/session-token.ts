import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "rebuild_session";
export const DEVICE_USER_COOKIE = "rebuild_device_user";

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

export async function signSessionToken(
  user: { id: string; email: string; onboarded: boolean },
  remember: boolean,
  days: number,
): Promise<string> {
  return new SignJWT({
    email: user.email,
    onboarded: user.onboarded,
    remember,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
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
