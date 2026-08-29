"use client";

import Link from "next/link";
import { FEATURED_THEME_IDS, THEMES, type ThemeId } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

type RoleKey = "bg" | "accent" | "accent2" | "good" | "text";

const PALETTE_ROLES: { key: RoleKey; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "accent", label: "Accent" },
  { key: "accent2", label: "Accent 2" },
  { key: "good", label: "Good" },
  { key: "text", label: "Text" },
];

const ROLE_COLORS: Record<ThemeId, Record<RoleKey, string>> = {
  "zion-peak": {
    bg: "#f7f9fc",
    accent: "#f0c43a",
    accent2: "#f5d266",
    good: "#5a9e8a",
    text: "#1a2744",
  },
  "coral-bloom": {
    bg: "#fff5f1",
    accent: "#e07a5f",
    accent2: "#f2a391",
    good: "#7eb89a",
    text: "#3d241c",
  },
  "harbor-blue": {
    bg: "#f3f7fb",
    accent: "#4a7ab5",
    accent2: "#7aa3d4",
    good: "#6fafa0",
    text: "#1e334d",
  },
  "honey-wheat": {
    bg: "#fbf6eb",
    accent: "#c9922e",
    accent2: "#dfb45a",
    good: "#7fa86a",
    text: "#3d3218",
  },
  "lilac-haze": {
    bg: "#f6f3fa",
    accent: "#8f7bb8",
    accent2: "#b3a3d4",
    good: "#8fafa0",
    text: "#3a3250",
  },
  "rose-clay": {
    bg: "#fbf4f6",
    accent: "#c47a8a",
    accent2: "#d9a0ab",
    good: "#8fafa0",
    text: "#3d2a30",
  },
  seafoam: {
    bg: "#f1faf7",
    accent: "#3d9b8f",
    accent2: "#6dbfb3",
    good: "#3d9b8f",
    text: "#1e3d38",
  },
  "butter-lemon": {
    bg: "#fffbed",
    accent: "#d4b43a",
    accent2: "#e6c96a",
    good: "#7aa86a",
    text: "#3a3018",
  },
  "plum-mist": {
    bg: "#f5f3f7",
    accent: "#8a6b8f",
    accent2: "#b091b5",
    good: "#7fa89a",
    text: "#382e3a",
  },
  "cedar-cream": {
    bg: "#faf6f0",
    accent: "#b86b45",
    accent2: "#d4926e",
    good: "#7a9e7a",
    text: "#3a281c",
  },
  "jade-mist": {
    bg: "#f3f8f4",
    accent: "#4f9a78",
    accent2: "#7aba98",
    good: "#4f9a78",
    text: "#24382c",
  },
  forest: {
    bg: "#0f1c18",
    accent: "#d4844a",
    accent2: "#e09358",
    good: "#7fbf9a",
    text: "#f3ece2",
  },
  "morning-mist": {
    bg: "#eef4f8",
    accent: "#6b9bd1",
    accent2: "#8bb4de",
    good: "#8bb8a8",
    text: "#2c3e50",
  },
  "sage-clay": {
    bg: "#f4f1ec",
    accent: "#d4956a",
    accent2: "#e0a87a",
    good: "#7a9e87",
    text: "#3a3530",
  },
  "ember-glow": {
    bg: "#1a2433",
    accent: "#e8a574",
    accent2: "#efb888",
    good: "#7a9e9a",
    text: "#f5f0ea",
  },
  "ocean-glass": {
    bg: "#f0f7fa",
    accent: "#4a9bb5",
    accent2: "#6bb5cc",
    good: "#7ec4b8",
    text: "#1e3a4a",
  },
  "terracotta-dawn": {
    bg: "#fbf6f1",
    accent: "#e0986a",
    accent2: "#ecb080",
    good: "#a8b890",
    text: "#3d3229",
  },
  "forest-bath": {
    bg: "#f2f6f3",
    accent: "#6b9e8a",
    accent2: "#84b49e",
    good: "#6b9e8a",
    text: "#2a3d34",
  },
  "periwinkle-pause": {
    bg: "#f3f2f8",
    accent: "#8b9fd4",
    accent2: "#a4b4de",
    good: "#9eb8c4",
    text: "#3d3a50",
  },
  "sunlit-grove": {
    bg: "#f7faf5",
    accent: "#5f9e7a",
    accent2: "#78b090",
    good: "#5f9e7a",
    text: "#2d4035",
  },
  "twilight-teal": {
    bg: "#152428",
    accent: "#6bb5c4",
    accent2: "#88c8d4",
    good: "#7a9e9a",
    text: "#e8f0f2",
  },
  "paper-ink": {
    bg: "#fafaf8",
    accent: "#5b8fc7",
    accent2: "#78a4d4",
    good: "#6a9e7b",
    text: "#2a2a28",
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
  const featured = THEMES.filter((t) => FEATURED_THEME_IDS.includes(t.id));

  return (
    <main className="page themes-board">
      <header className="themes-board-header">
        <p className="eyebrow">Color board</p>
        <h1>Themes & palettes</h1>
        <p className="muted">
          Soft light backgrounds. Tap a card to preview it live — Zion Peak
          leads with navy lettering + sunny yellow.
        </p>
        <Link href="/settings" className="themes-board-link">
          ← Back to settings
        </Link>
      </header>

      <section className="themes-board-section">
        <div className="palette-grid">
          {featured.map((option) => (
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
