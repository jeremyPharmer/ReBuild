"use client";

import { THEMES, type ThemeId } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="panel theme-picker">
      <p className="eyebrow">Appearance preview</p>
      <p className="muted" style={{ marginTop: 0, lineHeight: 1.45 }}>
        Try a softer look. Saved on this device only — backend unchanged.
      </p>
      <div className="theme-picker-grid">
        {THEMES.map((option) => {
          const selected = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={
                selected ? "theme-card theme-card-selected" : "theme-card"
              }
              aria-pressed={selected}
              onClick={() => setTheme(option.id as ThemeId)}
            >
              <span className="theme-card-swatches" aria-hidden>
                {option.swatches.map((color) => (
                  <span
                    key={color}
                    className="theme-card-swatch"
                    style={{ background: color }}
                  />
                ))}
              </span>
              <span className="theme-card-copy">
                <span className="theme-card-label">{option.label}</span>
                <span className="theme-card-desc">{option.description}</span>
              </span>
              {selected ? (
                <span className="theme-card-badge">Active</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
