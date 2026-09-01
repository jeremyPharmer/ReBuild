"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type CompassOption = {
  id: number;
  name: string;
  vibe: string;
  art: ReactNode;
};

const OPTIONS: CompassOption[] = [
  {
    id: 1,
    name: "Classic dual-tone",
    vibe: "The original — navy sky, gold north, sage south",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2744" />
        <circle cx="512" cy="512" r="280" fill="none" stroke="#f4f1ea" strokeWidth="28" opacity="0.4" />
        <path d="M512 220 L580 444 L512 512 L444 444 Z" fill="#f0c43a" />
        <path d="M512 804 L444 580 L512 512 L580 580 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="40" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 2,
    name: "Sage field",
    vibe: "Soft green background — matches JeremyOS UI",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#8fa87a" />
        <circle cx="512" cy="512" r="300" fill="#f4f1ea" />
        <path d="M512 240 L568 480 L512 512 L456 480 Z" fill="#1a2118" />
        <path d="M512 784 L456 544 L512 512 L568 544 Z" fill="#c4714a" opacity="0.7" />
        <circle cx="512" cy="512" r="36" fill="#1a2118" />
      </>
    ),
  },
  {
    id: 3,
    name: "Cream paper",
    vibe: "Warm home-screen tone, ink compass",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <circle cx="512" cy="512" r="320" fill="none" stroke="#1a2118" strokeWidth="32" />
        <path d="M512 200 L572 460 L512 512 L452 460 Z" fill="#1a2118" />
        <path d="M512 824 L452 564 L512 512 L572 564 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="44" fill="#c4714a" />
      </>
    ),
  },
  {
    id: 4,
    name: "Line only",
    vibe: "Ultra minimal — stroke compass, no fill blocks",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <circle cx="512" cy="512" r="300" fill="none" stroke="#f4f1ea" strokeWidth="24" />
        <path d="M512 220 L512 512 M512 512 L512 804" stroke="#f4f1ea" strokeWidth="20" strokeLinecap="round" />
        <path d="M512 220 L580 400 L512 512 L444 400 Z" fill="none" stroke="#f0c43a" strokeWidth="28" strokeLinejoin="round" />
        <path d="M512 804 L444 624 L512 512 L580 624 Z" fill="none" stroke="#8fa87a" strokeWidth="28" strokeLinejoin="round" />
        <circle cx="512" cy="512" r="32" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 5,
    name: "Cardinal letters",
    vibe: "N · E · S · W — map energy",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#2a3528" />
        <circle cx="512" cy="512" r="280" fill="none" stroke="#f4f1ea" strokeWidth="20" opacity="0.5" />
        <path d="M512 260 L560 460 L512 512 L464 460 Z" fill="#f0c43a" />
        <path d="M512 764 L464 564 L512 512 L560 564 Z" fill="#8fa87a" />
        <text x="512" y="200" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="72" fontWeight="700" fill="#f4f1ea">N</text>
        <text x="820" y="530" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="56" fontWeight="600" fill="#f4f1ea" opacity="0.6">E</text>
        <text x="512" y="860" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="56" fontWeight="600" fill="#f4f1ea" opacity="0.6">S</text>
        <text x="204" y="530" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="56" fontWeight="600" fill="#f4f1ea" opacity="0.6">W</text>
        <circle cx="512" cy="512" r="36" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 6,
    name: "Eight-point star",
    vibe: "Full rose — all directions marked",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2744" />
        <path d="M512 180 L560 464 L512 512 L464 464 Z" fill="#f0c43a" />
        <path d="M512 844 L464 560 L512 512 L560 560 Z" fill="#8fa87a" />
        <path d="M180 512 L464 464 L512 512 L464 560 Z" fill="#f4f1ea" opacity="0.35" />
        <path d="M844 512 L560 464 L512 512 L560 560 Z" fill="#f4f1ea" opacity="0.35" />
        <path d="M280 280 L480 480 L512 512 L480 544 Z" fill="#f4f1ea" opacity="0.2" />
        <path d="M744 744 L544 544 L512 512 L544 480 Z" fill="#f4f1ea" opacity="0.2" />
        <path d="M744 280 L544 480 L512 512 L544 544 Z" fill="#f4f1ea" opacity="0.2" />
        <path d="M280 744 L480 544 L512 512 L480 480 Z" fill="#f4f1ea" opacity="0.2" />
        <circle cx="512" cy="512" r="300" fill="none" stroke="#f4f1ea" strokeWidth="16" opacity="0.3" />
        <circle cx="512" cy="512" r="40" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 7,
    name: "Compass rose",
    vibe: "Nautical chart — layered petals",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <circle cx="512" cy="512" r="340" fill="#1a2744" />
        <circle cx="512" cy="512" r="300" fill="none" stroke="#f4f1ea" strokeWidth="8" opacity="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <path
            key={deg}
            d="M512 512 L512 220 L540 480 Z"
            fill={deg === 0 ? "#f0c43a" : deg % 90 === 0 ? "#f4f1ea" : "#8fa87a"}
            opacity={deg === 0 ? 1 : deg % 90 === 0 ? 0.5 : 0.35}
            transform={`rotate(${deg} 512 512)`}
          />
        ))}
        <circle cx="512" cy="512" r="48" fill="#f4f1ea" />
        <circle cx="512" cy="512" r="24" fill="#1a2744" />
      </>
    ),
  },
  {
    id: 8,
    name: "Mets compass",
    vibe: "Royal blue field, orange north needle",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#002d72" />
        <circle cx="512" cy="512" r="290" fill="none" stroke="#e8eef8" strokeWidth="24" opacity="0.45" />
        <path d="M512 230 L576 460 L512 512 L448 460 Z" fill="#ff5910" />
        <path d="M512 794 L448 564 L512 512 L576 564 Z" fill="#e8eef8" opacity="0.5" />
        <circle cx="512" cy="512" r="42" fill="#e8eef8" />
      </>
    ),
  },
  {
    id: 9,
    name: "Forest night",
    vibe: "Dark green + terracotta — earthy journey",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <circle cx="512" cy="512" r="300" fill="none" stroke="#8fa87a" strokeWidth="24" opacity="0.5" />
        <path d="M512 220 L576 448 L512 512 L448 448 Z" fill="#c4714a" />
        <path d="M512 804 L448 576 L512 512 L576 576 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="38" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 10,
    name: "Gold ring",
    vibe: "Thin gold circle, bold north arrow",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2744" />
        <circle cx="512" cy="512" r="320" fill="none" stroke="#f0c43a" strokeWidth="36" />
        <path d="M512 200 L540 500 L512 512 L484 500 Z" fill="#f0c43a" />
        <path d="M512 824 L484 524 L512 512 L540 524 Z" fill="#f4f1ea" opacity="0.4" />
        <circle cx="512" cy="512" r="28" fill="#f0c43a" />
      </>
    ),
  },
  {
    id: 11,
    name: "Long needle",
    vibe: "Strong north pointer — decisive direction",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#2a4a52" />
        <circle cx="512" cy="512" r="280" fill="none" stroke="#f4f1ea" strokeWidth="20" opacity="0.35" />
        <path d="M512 160 L548 500 L512 512 L476 500 Z" fill="#f4f1ea" />
        <path d="M512 864 L476 524 L512 512 L548 524 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="44" fill="#f0c43a" />
      </>
    ),
  },
  {
    id: 12,
    name: "Diamond needle",
    vibe: "Geometric lozenge — modern, sharp",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#8fa87a" />
        <circle cx="512" cy="512" r="300" fill="#f4f1ea" />
        <path d="M512 240 L580 512 L512 784 L444 512 Z" fill="#1a2118" />
        <path d="M512 512 L580 512 L512 784 L444 512 Z" fill="#c4714a" />
        <circle cx="512" cy="512" r="32" fill="#f4f1ea" stroke="#1a2118" strokeWidth="12" />
      </>
    ),
  },
  {
    id: 13,
    name: "Nautical double ring",
    vibe: "Two rings + crosshair — chart plotter",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <circle cx="512" cy="512" r="340" fill="none" stroke="#1a2744" strokeWidth="28" />
        <circle cx="512" cy="512" r="260" fill="none" stroke="#1a2744" strokeWidth="12" opacity="0.4" />
        <path d="M512 180 L512 844" stroke="#1a2744" strokeWidth="8" opacity="0.25" />
        <path d="M180 512 L844 512" stroke="#1a2744" strokeWidth="8" opacity="0.25" />
        <path d="M512 220 L552 480 L512 512 L472 480 Z" fill="#1a2744" />
        <path d="M512 804 L472 544 L512 512 L552 544 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="40" fill="#c4714a" />
      </>
    ),
  },
  {
    id: 14,
    name: "Minimal dot",
    vibe: "Tiny compass — reads clean at icon size",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <path d="M512 320 L536 500 L512 512 L488 500 Z" fill="#f0c43a" />
        <path d="M512 704 L488 524 L512 512 L536 524 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="200" fill="none" stroke="#f4f1ea" strokeWidth="16" opacity="0.25" />
        <circle cx="512" cy="512" r="20" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 15,
    name: "Journey path",
    vibe: "Compass + subtle arc — Zion / forward motion",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2744" />
        <path d="M200 760 Q512 320 824 760" stroke="#8fa87a" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.45" />
        <circle cx="512" cy="512" r="260" fill="none" stroke="#f4f1ea" strokeWidth="22" opacity="0.35" />
        <path d="M512 280 L564 480 L512 512 L460 480 Z" fill="#f0c43a" />
        <path d="M512 744 L460 544 L512 512 L564 544 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="36" fill="#f4f1ea" />
      </>
    ),
  },
];

export default function CompassIconOptionsPage() {
  return (
    <main className="page icon-options-board">
      <header className="layouts-board-header">
        <p className="eyebrow">Brand mark</p>
        <h1>15 compass icons</h1>
        <p className="muted">
          Variations on the compass you liked. Pick a number to ship as{" "}
          <code>apple-icon.png</code>.
        </p>
        <div className="layouts-board-links">
          <Link href="/icon-options" className="layouts-board-link">
            ← All icons
          </Link>
          <Link href="/favicons" className="layouts-board-link">
            Favicons
          </Link>
          <Link href="/" className="layouts-board-link">
            Home
          </Link>
        </div>
      </header>

      <section className="icon-options-grid">
        {OPTIONS.map((opt) => (
          <article key={opt.id} className="icon-option-card panel">
            <svg
              className="icon-option-art"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              {opt.art}
            </svg>
            <div>
              <h2>
                {opt.id}. {opt.name}
              </h2>
              <p className="muted">{opt.vibe}</p>
            </div>
          </article>
        ))}
      </section>

      <p className="muted icon-options-note panel">
        Tell me your favorite number — I&apos;ll deploy it as the home-screen
        icon.
      </p>
    </main>
  );
}
