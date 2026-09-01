"use client";

import Link from "next/link";

const SHIPPED = "j-live.svg";

const OPTIONS = [
  {
    file: "j-live.svg",
    name: "J · Live",
    vibe: "Personal mark + status dot — “Jeremy’s system is on.”",
  },
  {
    file: "command-grid.svg",
    name: "Command Grid",
    vibe: "Four-tile launcher — personal OS / dashboard, not a generic app icon.",
  },
  {
    file: "briefing-stack.svg",
    name: "Briefing Stack",
    vibe: "Chief-of-staff morning brief — priorities first, details below.",
  },
  {
    file: "chief-crown.svg",
    name: "Chief Crest",
    vibe: "Executive badge — “runs the day,” slightly ceremonial.",
  },
  {
    file: "terminal-prompt.svg",
    name: "Terminal Prompt",
    vibe: "Developer OS — command line energy, iron-hour / gym dark mode.",
  },
  {
    file: "hub-node.svg",
    name: "Hub Node",
    vibe: "Center of your apps & rituals — spokes to calendar, journal, money.",
  },
] as const;

export default function FaviconsPage() {
  return (
    <main className="page favicons-board">
      <header className="layouts-board-header">
        <p className="eyebrow">Brand mark</p>
        <h1>Favicon options</h1>
        <p className="muted">
          Six directions for JeremyOS — executive assistant / personal OS, not a
          soft recovery app. The live site uses{" "}
          <strong>J · Live</strong> (<code>src/app/icon.svg</code>). Swap the
          file to try another; previews below are{" "}
          <code>/favicons/*.svg</code>.
        </p>
        <div className="layouts-board-links">
          <Link href="/" className="layouts-board-link">← Home</Link>
          <Link href="/settings" className="layouts-board-link">Settings</Link>
          <Link href="/themes" className="layouts-board-link">Themes</Link>
        </div>
      </header>

      <section className="favicons-grid">
        {OPTIONS.map((opt) => (
          <article key={opt.file} className="favicon-option-card panel">
            <div className="favicon-option-preview">
              <img
                src={`/favicons/${opt.file}`}
                width={64}
                height={64}
                alt=""
              />
              <img
                src={`/favicons/${opt.file}`}
                width={32}
                height={32}
                alt=""
                className="favicon-option-small"
              />
              <img
                src={`/favicons/${opt.file}`}
                width={16}
                height={16}
                alt=""
                className="favicon-option-tiny"
              />
            </div>
            <div>
              <div className="layout-gallery-title-row">
                <h2>{opt.name}</h2>
                {opt.file === SHIPPED ? (
                  <span className="layout-pick-badge">Shipped</span>
                ) : null}
              </div>
              <p className="muted">{opt.vibe}</p>
              <p className="favicon-option-path muted">
                <code>public/favicons/{opt.file}</code>
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
