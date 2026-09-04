export const HOME_LAYOUT_STORAGE_KEY = "jeremyos-home-layout";

export type HomeLayoutId =
  | "classic"
  | "briefing"
  | "split-day"
  | "train-first"
  | "ritual"
  | "command"
  | "wind-down"
  | "dual-pillar";

export type HomeBlockId =
  | "date"
  | "weather"
  | "today"
  | "move"
  | "entertainment"
  | "week"
  | "header-strip"
  | "hubs"
  | "focus-rail";

export type HomeLayoutOption = {
  id: HomeLayoutId;
  label: string;
  tagline: string;
  description: string;
  /** Why this fits JeremyOS */
  bestFor: string;
  /** Wireframe rows for the gallery (each row is left→right blocks) */
  preview: HomeBlockId[][];
};

export const HOME_LAYOUTS: HomeLayoutOption[] = [
  {
    id: "classic",
    label: "Classic Stack",
    tagline: "One clear column",
    description:
      "Date → weather → today’s work → Move & crossword → week plan. Simple and familiar.",
    bestFor: "Default daily driver when you want zero decisions.",
    preview: [
      ["date"],
      ["weather"],
      ["today"],
      ["move", "entertainment"],
      ["week"],
    ],
  },
  {
    id: "briefing",
    label: "Morning Briefing",
    tagline: "EA desk, todos first",
    description:
      "Compact date + weather strip, then a large Today briefing. Move and crossword follow the checklist; week plan tucks below.",
    bestFor: "Executive-assistant mornings — what matters before the puzzle.",
    preview: [
      ["header-strip"],
      ["today"],
      ["move", "entertainment"],
      ["week"],
    ],
  },
  {
    id: "split-day",
    label: "Split Day",
    tagline: "Work beside life",
    description:
      "Today’s checklist and Move on the primary rail; crossword stacked on the side. Week plan spans the bottom.",
    bestFor: "Seeing progress and the daily puzzle in one glance.",
    preview: [
      ["date"],
      ["weather"],
      ["today", "focus-rail"],
      ["week"],
    ],
  },
  {
    id: "train-first",
    label: "Train First",
    tagline: "Move sets the day",
    description:
      "Checklist first, then a hero Move card. Crossword and week plan follow — tasks before training.",
    bestFor: "Training weeks when you still want todos up top.",
    preview: [
      ["date"],
      ["weather"],
      ["today"],
      ["move"],
      ["entertainment"],
      ["week"],
    ],
  },
  {
    id: "ritual",
    label: "Ritual Page",
    tagline: "Editorial & calm",
    description:
      "Oversized date, soft weather, paper-like Today list, week targets, hubs tucked low. Feels like opening a daybook.",
    bestFor: "Journal-leaning mornings and lower stimulation.",
    preview: [
      ["date"],
      ["weather"],
      ["today"],
      ["hubs"],
      ["week"],
    ],
  },
  {
    id: "command",
    label: "Command Center",
    tagline: "Dense & modern",
    description:
      "Slim header bar, compact Today, Move right below, then a twin board: week plan and crossword. More signal, less scroll.",
    bestFor: "High-output weekdays when you want a dashboard feel.",
    preview: [
      ["header-strip"],
      ["today"],
      ["move"],
      ["week", "entertainment"],
    ],
  },
  {
    id: "wind-down",
    label: "Wind-Down",
    tagline: "Evening first",
    description:
      "Crossword leads, then leftover todos, Move, and week. Built for closing the day without a guilt stack.",
    bestFor: "Nights and soft landings.",
    preview: [
      ["date"],
      ["entertainment"],
      ["today"],
      ["move"],
      ["week"],
    ],
  },
  {
    id: "dual-pillar",
    label: "Dual Pillars",
    tagline: "Move + puzzle heroes",
    description:
      "Checklist first, then equal Move and crossword heroes. Week plan sits below as a supporting rail.",
    bestFor: "Weekends and recovery days that still stay intentional.",
    preview: [
      ["date"],
      ["weather"],
      ["today"],
      ["move", "entertainment"],
      ["week"],
    ],
  },
];

export const DEFAULT_HOME_LAYOUT: HomeLayoutId = "briefing";

export function isHomeLayoutId(value: string): value is HomeLayoutId {
  return HOME_LAYOUTS.some((l) => l.id === value);
}

export function getHomeLayout(id: HomeLayoutId): HomeLayoutOption {
  return HOME_LAYOUTS.find((l) => l.id === id) ?? HOME_LAYOUTS[0];
}

export const PREVIEW_BLOCK_LABELS: Record<HomeBlockId, string> = {
  date: "Date",
  weather: "Weather",
  today: "Today",
  move: "Move",
  entertainment: "Crossword",
  week: "Week plan",
  "header-strip": "Date + weather",
  hubs: "Move · Crossword",
  "focus-rail": "Crossword",
};
