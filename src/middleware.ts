import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";

const PUBLIC_PREFIXES = [
  "/login",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/cron",
];

function isPublic(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt"
  ) {
    return true;
  }
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) {
    // Logged-in + onboarded users shouldn't sit on login
    if (pathname === "/login" || pathname === "/forgot-password") {
      const token = req.cookies.get(SESSION_COOKIE)?.value;
      if (token) {
        const session = await verifySessionToken(token);
        if (session?.onboarded) {
          return NextResponse.redirect(new URL("/", req.url));
        }
        if (session && !session.onboarded) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const url = new URL("/onboarding", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const res = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Sign in required" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (!session.onboarded && !pathname.startsWith("/onboarding") && !pathname.startsWith("/api/")) {
    // Allow API during setup (onboard, rewards, auth, state)
    if (
      pathname.startsWith("/api/onboard") ||
      pathname.startsWith("/api/rewards") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/state")
    ) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Finish onboarding first" },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (session.onboarded && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
