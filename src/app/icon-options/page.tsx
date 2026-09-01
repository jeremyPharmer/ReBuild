"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type IconOption = {
  id: number;
  name: string;
  vibe: string;
  art: ReactNode;
};

const OPTIONS: IconOption[] = [
  {
    id: 1,
    name: "Constellation J",
    vibe: "Your current mark — dark forest + terracotta path",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <circle cx="280" cy="220" r="28" fill="#f4f1ea" opacity="0.5" />
        <circle cx="760" cy="780" r="22" fill="#f4f1ea" opacity="0.4" />
        <path
          d="M720 260 L520 460 L520 720 L280 820"
          stroke="#c4714a"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="720" cy="260" r="44" fill="#f4f1ea" />
        <circle cx="520" cy="460" r="44" fill="#f4f1ea" />
        <circle cx="520" cy="720" r="44" fill="#f4f1ea" />
        <circle cx="280" cy="820" r="44" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 2,
    name: "Sage monogram",
    vibe: "Soft green field, cream serif J — matches app UI",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#8fa87a" />
        <text
          x="512"
          y="640"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="520"
          fontWeight="600"
          fill="#f4f1ea"
        >
          J
        </text>
      </>
    ),
  },
  {
    id: 3,
    name: "Cream seal",
    vibe: "Warm paper tone — feels like the Home screen",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <circle
          cx="512"
          cy="512"
          r="340"
          fill="none"
          stroke="#1a2118"
          strokeWidth="36"
        />
        <text
          x="512"
          y="580"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="380"
          fontWeight="600"
          fill="#1a2118"
        >
          J
        </text>
      </>
    ),
  },
  {
    id: 4,
    name: "Three pillars",
    vibe: "Today · Journey · Journal rhythm",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <rect x="260" y="300" width="120" height="424" rx="60" fill="#8fa87a" />
        <rect x="452" y="220" width="120" height="504" rx="60" fill="#f4f1ea" />
        <rect x="644" y="360" width="120" height="364" rx="60" fill="#c4714a" />
      </>
    ),
  },
  {
    id: 5,
    name: "Sunrise arc",
    vibe: "Morning ritual / start the day",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#2a3528" />
        <circle cx="512" cy="620" r="200" fill="#f0c43a" />
        <path
          d="M180 620 A332 332 0 0 1 844 620"
          stroke="#f4f1ea"
          strokeWidth="48"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M120 720 H904"
          stroke="#8fa87a"
          strokeWidth="28"
          strokeLinecap="round"
          opacity="0.6"
        />
      </>
    ),
  },
  {
    id: 6,
    name: "Check path",
    vibe: "Tasks + today’s items done",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#8fa87a" />
        <circle cx="512" cy="512" r="300" fill="#f4f1ea" />
        <path
          d="M340 520 L460 640 L700 380"
          stroke="#1a2118"
          strokeWidth="56"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    ),
  },
  {
    id: 7,
    name: "OS rings",
    vibe: "Personal operating system — layers",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <circle
          cx="512"
          cy="512"
          r="300"
          fill="none"
          stroke="#f4f1ea"
          strokeWidth="36"
          opacity="0.35"
        />
        <circle
          cx="512"
          cy="512"
          r="210"
          fill="none"
          stroke="#8fa87a"
          strokeWidth="36"
        />
        <circle cx="512" cy="512" r="120" fill="#c4714a" />
      </>
    ),
  },
  {
    id: 8,
    name: "Calendar dot",
    vibe: "Agenda + schedule at a glance",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <rect
          x="220"
          y="240"
          width="584"
          height="544"
          rx="48"
          fill="#fff"
          stroke="#1a2118"
          strokeWidth="24"
        />
        <rect x="220" y="240" width="584" height="120" rx="48" fill="#8fa87a" />
        <circle cx="380" cy="520" r="36" fill="#d8d4cb" />
        <circle cx="512" cy="520" r="36" fill="#d8d4cb" />
        <circle cx="644" cy="520" r="36" fill="#c4714a" />
        <circle cx="380" cy="640" r="36" fill="#d8d4cb" />
        <circle cx="512" cy="640" r="36" fill="#d8d4cb" />
      </>
    ),
  },
  {
    id: 9,
    name: "Compass",
    vibe: "Journey navigation — Zion / adventure",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2744" />
        <circle
          cx="512"
          cy="512"
          r="280"
          fill="none"
          stroke="#f4f1ea"
          strokeWidth="28"
          opacity="0.4"
        />
        <path d="M512 220 L580 444 L512 512 L444 444 Z" fill="#f0c43a" />
        <path d="M512 804 L444 580 L512 512 L580 580 Z" fill="#8fa87a" />
        <circle cx="512" cy="512" r="40" fill="#f4f1ea" />
      </>
    ),
  },
  {
    id: 10,
    name: "Leaf",
    vibe: "Forest / kitchen-herb calm",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <path
          d="M512 200 C320 320 260 520 300 720 C360 560 440 440 512 380 C584 440 664 560 724 720 C764 520 704 320 512 200Z"
          fill="#8fa87a"
        />
        <path
          d="M512 380 V820"
          stroke="#1a2118"
          strokeWidth="28"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: 11,
    name: "Wave",
    vibe: "Daily rhythm — breathe in/out",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#2a4a52" />
        <path
          d="M160 560 C280 440 400 680 520 560 S760 440 864 560"
          stroke="#8fa87a"
          strokeWidth="52"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M160 680 C280 560 400 800 520 680 S760 560 864 680"
          stroke="#f4f1ea"
          strokeWidth="36"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </>
    ),
  },
  {
    id: 12,
    name: "Mets badge",
    vibe: "Default theme — royal blue + orange",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#002d72" />
        <text
          x="512"
          y="620"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="480"
          fontWeight="700"
          fill="#ff5910"
        >
          J
        </text>
      </>
    ),
  },
  {
    id: 13,
    name: "North star",
    vibe: "Guide / executive assistant",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#1a2118" />
        <path
          d="M512 200 L560 440 L800 488 L560 536 L512 776 L464 536 L224 488 L464 440 Z"
          fill="#f4f1ea"
        />
        <circle cx="512" cy="488" r="48" fill="#c4714a" />
      </>
    ),
  },
  {
    id: 14,
    name: "Bridge",
    vibe: "ReBuild / crossing into next chapter",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#f4f1ea" />
        <path
          d="M200 640 Q512 280 824 640"
          stroke="#1a2118"
          strokeWidth="48"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M200 640 H824"
          stroke="#8fa87a"
          strokeWidth="36"
          strokeLinecap="round"
        />
        <rect x="472" y="500" width="80" height="140" rx="12" fill="#c4714a" />
      </>
    ),
  },
  {
    id: 15,
    name: "Minimal dot",
    vibe: "Ultra-clean — one focal point",
    art: (
      <>
        <rect width="1024" height="1024" rx="220" fill="#8fa87a" />
        <circle cx="512" cy="512" r="120" fill="#f4f1ea" />
        <circle cx="512" cy="512" r="48" fill="#1a2118" />
      </>
    ),
  },
];

export default function IconOptionsPage() {
  return (
    <main className="page icon-options-board">
      <header className="layouts-board-header">
        <p className="eyebrow">Brand mark</p>
        <h1>15 home-screen icon options</h1>
        <p className="muted">
          Mockups for Add to Home Screen. Tell me a number to ship as{" "}
          <code>apple-icon.png</code>.
        </p>
        <div className="layouts-board-links">
          <Link href="/" className="layouts-board-link">
            ← Home
          </Link>
          <Link href="/icon-options/compass" className="layouts-board-link">
            Compass set
          </Link>
          <Link href="/favicons" className="layouts-board-link">
            Favicons
          </Link>
          <Link href="/themes" className="layouts-board-link">
            Themes
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
        After you pick a number, re-add to Home Screen (Share → Add to Home
        Screen) to refresh the icon on your iPhone.
      </p>
    </main>
  );
}
