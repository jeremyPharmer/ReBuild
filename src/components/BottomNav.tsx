"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "Journey" },
  { href: "/money", label: "Rewards" },
  { href: "/journal", label: "Journal" },
  { href: "/plan", label: "Plan" },
];

export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/onboarding") || path.startsWith("/morning") || path.startsWith("/evening") || path.startsWith("/craving")) {
    return null;
  }
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {LINKS.map((l) => {
        const active = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "nav-link active" : "nav-link"}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
