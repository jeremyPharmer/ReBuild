export const THEME_STORAGE_KEY = "rebuild-theme";

export type ThemeId = "forest" | "morning-mist" | "sage-clay" | "ember-glow";

export type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
  swatches: [string, string, string];
};

export const THEMES: ThemeOption[] = [
  {
    id: "forest",
    label: "Forest",
    description: "Current dark green + terracotta",
    swatches: ["#0f1c18", "#d4844a", "#7fbf9a"],
  },
  {
    id: "morning-mist",
    label: "Morning Mist",
    description: "Soft sky blue, calm and light",
    swatches: ["#eef4f8", "#6b9bd1", "#8bb8a8"],
  },
  {
    id: "sage-clay",
    label: "Sage & Clay",
    description: "Earthy cream with green + peach",
    swatches: ["#f4f1ec", "#7a9e87", "#d4956a"],
  },
  {
    id: "ember-glow",
    label: "Ember Glow",
    description: "Soft navy with warm amber",
    swatches: ["#1a2433", "#e8a574", "#6bb5c4"],
  },
];

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

export function themeMetaColor(id: ThemeId): string {
  switch (id) {
    case "morning-mist":
      return "#eef4f8";
    case "sage-clay":
      return "#f4f1ec";
    case "ember-glow":
      return "#1a2433";
    default:
      return "#0f1c18";
  }
}
