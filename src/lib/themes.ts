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
  | "paper-ink"
  | "coral-bloom"
  | "harbor-blue"
  | "honey-wheat"
  | "lilac-haze"
  | "rose-clay"
  | "seafoam"
  | "butter-lemon"
  | "plum-mist"
  | "cedar-cream"
  | "jade-mist"
  | "zion-peak"
  | "mets-classic";

export type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
  swatches: [string, string, string];
};

/** Curated themes for the palette board. */
export const FEATURED_THEME_IDS: ThemeId[] = [
  "mets-classic",
  "zion-peak",
  "coral-bloom",
  "harbor-blue",
  "honey-wheat",
  "lilac-haze",
  "rose-clay",
  "seafoam",
  "butter-lemon",
  "plum-mist",
  "cedar-cream",
  "jade-mist",
];

export const THEMES: ThemeOption[] = [
  {
    id: "mets-classic",
    label: "Mets Classic",
    description: "Royal blue + orange + lime",
    swatches: ["#e8eef8", "#002d72", "#ff5910"],
  },
  {
    id: "zion-peak",
    label: "Zion Peak",
    description: "White + sunny yellow, navy lettering",
    swatches: ["#f7f9fc", "#f0c43a", "#1a2744"],
  },
  {
    id: "coral-bloom",
    label: "Coral Bloom",
    description: "Warm coral on soft blush cream",
    swatches: ["#fff5f1", "#e07a5f", "#f2a391"],
  },
  {
    id: "harbor-blue",
    label: "Harbor Blue",
    description: "Calm denim blue on cool mist",
    swatches: ["#f3f7fb", "#4a7ab5", "#7aa3d4"],
  },
  {
    id: "honey-wheat",
    label: "Honey Wheat",
    description: "Golden honey on warm wheat",
    swatches: ["#fbf6eb", "#c9922e", "#dfb45a"],
  },
  {
    id: "lilac-haze",
    label: "Lilac Haze",
    description: "Soft lilac on pale lavender",
    swatches: ["#f6f3fa", "#8f7bb8", "#b3a3d4"],
  },
  {
    id: "rose-clay",
    label: "Rose Clay",
    description: "Dusty rose on powder blush",
    swatches: ["#fbf4f6", "#c47a8a", "#d9a0ab"],
  },
  {
    id: "seafoam",
    label: "Seafoam",
    description: "Fresh teal on mint ice",
    swatches: ["#f1faf7", "#3d9b8f", "#6dbfb3"],
  },
  {
    id: "butter-lemon",
    label: "Butter Lemon",
    description: "Soft lemon with warm cocoa text",
    swatches: ["#fffbed", "#d4b43a", "#e6c96a"],
  },
  {
    id: "plum-mist",
    label: "Plum Mist",
    description: "Muted plum on cool gray-lilac",
    swatches: ["#f5f3f7", "#8a6b8f", "#b091b5"],
  },
  {
    id: "cedar-cream",
    label: "Cedar Cream",
    description: "Warm cedar rust on cream",
    swatches: ["#faf6f0", "#b86b45", "#d4926e"],
  },
  {
    id: "jade-mist",
    label: "Jade Mist",
    description: "Soft jade on pale celadon",
    swatches: ["#f3f8f4", "#4f9a78", "#7aba98"],
  },
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
  return THEMES.find((t) => t.id === id)?.swatches[0] ?? "#e8eef8";
}
