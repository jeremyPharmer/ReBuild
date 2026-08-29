"use client";

import Link from "next/link";
import { THEMES, type ThemeId } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

const METS_THEME_IDS: ThemeId[] = [
  "shea-night",
  "citi-day",
  "orange-crush",
  "lime-line",
  "flushing-dusk",
  "mets-classic",
];

type RoleKey = "bg" | "accent" | "accent2" | "lime" | "text";

const PALETTE_ROLES: { key: RoleKey; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "accent", label: "Accent" },
  { key: "accent2", label: "Accent 2" },
  { key: "lime", label: "Lime / Good" },
  { key: "text", label: "Text" },
];

const ROLE_COLORS: Record<
  ThemeId,
  Record<RoleKey, string>
> = {
  forest: {
    bg: "#0f1c18",
    accent: "#d4844a",
    accent2: "#e09358",
    lime: "#7fbf9a",
    text: "#f3ece2",
  },
  "morning-mist": {
    bg: "#eef4f8",
    accent: "#6b9bd1",
    accent2: "#8bb4de",
    lime: "#8bb8a8",
    text: "#2c3e50",
  },
  "sage-clay": {
    bg: "#f4f1ec",
    accent: "#d4956a",
    accent2: "#e0a87a",
    lime: "#7a9e87",
    text: "#3a3530",
  },
  "ember-glow": {
    bg: "#1a2433",
    accent: "#e8a574",
    accent2: "#efb888",
    lime: "#7a9e9a",
    text: "#f5f0ea",
  },
  "ocean-glass": {
    bg: "#f0f7fa",
    accent: "#4a9bb5",
    accent2: "#6bb5cc",
    lime: "#7ec4b8",
    text: "#1e3a4a",
  },
  "terracotta-dawn": {
    bg: "#fbf6f1",
    accent: "#e0986a",
    accent2: "#ecb080",
    lime: "#a8b890",
    text: "#3d3229",
  },
  "forest-bath": {
    bg: "#f2f6f3",
    accent: "#6b9e8a",
    accent2: "#84b49e",
    lime: "#6b9e8a",
    text: "#2a3d34",
  },
  "periwinkle-pause": {
    bg: "#f3f2f8",
    accent: "#8b9fd4",
    accent2: "#a4b4de",
    lime: "#9eb8c4",
    text: "#3d3a50",
  },
  "sunlit-grove": {
    bg: "#f7faf5",
    accent: "#5f9e7a",
    accent2: "#78b090",
    lime: "#5f9e7a",
    text: "#2d4035",
  },
  "twilight-teal": {
    bg: "#152428",
    accent: "#6bb5c4",
    accent2: "#88c8d4",
    lime: "#7a9e9a",
    text: "#e8f0f2",
  },
  "paper-ink": {
    bg: "#fafaf8",
    accent: "#5b8fc7",
    accent2: "#78a4d4",
    lime: "#6a9e7b",
    text: "#2a2a28",
  },
  "shea-night": {
    bg: "#071533",
    accent: "#ff5910",
    accent2: "#ff7a3d",
    lime: "#c5e063",
    text: "#eef2fa",
  },
  "citi-day": {
    bg: "#f2f6fc",
    accent: "#002d72",
    accent2: "#ff5910",
    lime: "#9bc53d",
    text: "#0e1f3d",
  },
  "orange-crush": {
    bg: "#fff7f2",
    accent: "#ff5910",
    accent2: "#002d72",
    lime: "#9bc53d",
    text: "#2a160c",
  },
  "lime-line": {
    bg: "#f5faf0",
    accent: "#9bc53d",
    accent2: "#002d72",
    lime: "#b0d65a",
    text: "#1a2a18",
  },
  "flushing-dusk": {
    bg: "#121a2e",
    accent: "#ff7a3d",
    accent2: "#ff9566",
    lime: "#b8d94a",
    text: "#e8ecf4",
  },
  "mets-classic": {
    bg: "#e8eef8",
    accent: "#002d72",
    accent2: "#ff5910",
    lime: "#c5e063",
    text: "#002d72",
  },
};

function contrastText(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.55 ? "#111" : "#fff";
}

function PaletteCard({
  id,
  label,
  description,
  selected,
  onSelect,
}: {
  id: ThemeId;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const roles = ROLE_COLORS[id];
  return (
    <button
      type="button"
      className={selected ? "palette-card palette-card-active" : "palette-card"}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="palette-card-head">
        <div>
          <strong>{label}</strong>
          <p>{description}</p>
        </div>
        {selected ? <span className="palette-badge">Active</span> : null}
      </div>
      <div className="palette-strips">
        {PALETTE_ROLES.map(({ key, label: roleLabel }) => {
          const color = roles[key];
          return (
            <div
              key={key}
              className="palette-strip"
              style={{ background: color, color: contrastText(color) }}
            >
              <span>{roleLabel}</span>
              <code>{color}</code>
            </div>
          );
        })}
      </div>
    </button>
  );
}

export default function ThemesPage() {
  const { theme, setTheme } = useTheme();
  const mets = THEMES.filter((t) => METS_THEME_IDS.includes(t.id));
  const rest = THEMES.filter((t) => !METS_THEME_IDS.includes(t.id));

  return (
    <main className="page themes-board">
      <header className="themes-board-header">
        <p className="eyebrow">Color board</p>
        <h1>Themes & palettes</h1>
        <p className="muted">
          Mets-inspired blue + orange + lime first. Tap a card to preview it
          live across the app.
        </p>
        <Link href="/settings" className="themes-board-link">
          ← Back to settings
        </Link>
      </header>

      <section className="themes-board-section">
        <h2>Mets family</h2>
        <p className="muted themes-board-core">
          Core: <code>#002D72</code> blue · <code>#FF5910</code> orange ·{" "}
          <code>#C5E063</code> / <code>#9BC53D</code> lime
        </p>
        <div className="palette-grid">
          {mets.map((option) => (
            <PaletteCard
              key={option.id}
              id={option.id}
              label={option.label}
              description={option.description}
              selected={theme === option.id}
              onSelect={() => setTheme(option.id)}
            />
          ))}
        </div>
      </section>

      <section className="themes-board-section">
        <h2>Existing themes</h2>
        <div className="palette-grid">
          {rest.map((option) => (
            <PaletteCard
              key={option.id}
              id={option.id}
              label={option.label}
              description={option.description}
              selected={theme === option.id}
              onSelect={() => setTheme(option.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
