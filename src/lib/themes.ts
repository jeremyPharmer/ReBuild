export const THEME_STORAGE_KEY = "rebuild-theme";

export type ThemeId =
  | "forest"
  | "morning-mist"
  | "sage-clay"
  | "ember-glow"
  | "ocean-glass"
  | "terracotta-dawn"
  | "forest-bath"
  | "periwinkle-pause"
  | "sunlit-grove"
  | "twilight-teal"
  | "paper-ink";

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
  {
    id: "ocean-glass",
    label: "Ocean Glass",
    description: "Frosted aqua, coastal and airy",
    swatches: ["#f0f7fa", "#4a9bb5", "#7ec4b8"],
  },
  {
    id: "terracotta-dawn",
    label: "Terracotta Dawn",
    description: "Warm cream with peach orange",
    swatches: ["#fbf6f1", "#e0986a", "#c4a882"],
  },
  {
    id: "forest-bath",
    label: "Forest Bath",
    description: "Soft mint green, grounded",
    swatches: ["#f2f6f3", "#6b9e8a", "#a8c9b8"],
  },
  {
    id: "periwinkle-pause",
    label: "Periwinkle Pause",
    description: "Lavender blue, low stimulation",
    swatches: ["#f3f2f8", "#8b9fd4", "#b8c5e8"],
  },
  {
    id: "sunlit-grove",
    label: "Sunlit Grove",
    description: "Bright mint with golden green",
    swatches: ["#f7faf5", "#5f9e7a", "#e8b86d"],
  },
  {
    id: "twilight-teal",
    label: "Twilight Teal",
    description: "Softer dark mode, teal + amber",
    swatches: ["#152428", "#6bb5c4", "#d4a574"],
  },
  {
    id: "paper-ink",
    label: "Paper & Ink",
    description: "Newsprint neutral with blue pop",
    swatches: ["#fafaf8", "#5b8fc7", "#2a2a28"],
  },
];

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

export function themeMetaColor(id: ThemeId): string {
  return THEMES.find((t) => t.id === id)?.swatches[0] ?? "#0f1c18";
}
