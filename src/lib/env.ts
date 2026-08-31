/** Runtime environment: dev vs prod (JeremyOS deploy target). */
export function isProdEnv(): boolean {
  const env = process.env.JEREMYOS_ENV ?? process.env.REBUILD_ENV;
  return env === "prod";
}

/** Public app URL for links in email, weather UA, etc. */
export function appBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  return isProdEnv()
    ? "https://jeremyos-prod.fly.dev"
    : "https://jeremyos-dev.fly.dev";
}
