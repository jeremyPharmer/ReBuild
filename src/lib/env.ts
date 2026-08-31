/** Runtime environment: dev vs prod (JeremyOS deploy target). */
export function isProdEnv(): boolean {
  const env =
    process.env.JEREMYOS_ENV ??
    process.env.REBUILD_ENV ??
    (process.env.VERCEL_ENV === "production" ? "prod" : undefined);
  return env === "prod";
}

function vercelAppHost(): string | null {
  const raw =
    process.env.APP_URL?.replace(/\/$/, "") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

/** Public app URL for links in email, weather UA, etc. */
export function appBaseUrl(): string {
  const vercel = vercelAppHost();
  if (vercel) return vercel.replace(/\/$/, "");
  return isProdEnv()
    ? "https://jeremyos.vercel.app"
    : "http://localhost:3000";
}

export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}
