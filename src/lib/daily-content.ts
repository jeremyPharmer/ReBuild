import {
  pickRecoveryOffers,
  RECOVERY_CONTENT_CATALOG,
  type RecoveryContentItem,
} from "./podcasts";

export type GeneralPodcastSource =
  | "indicator"
  | "planet-money"
  | "theo-von"
  | "prof-g"
  | "nfl-today";

export type DailyContentItem = RecoveryContentItem & {
  slot: "recovery" | "general";
  sourceKey?: GeneralPodcastSource;
};

const GENERAL_SOURCES: GeneralPodcastSource[] = [
  "indicator",
  "planet-money",
  "theo-von",
  "prof-g",
  "nfl-today",
];

/** Recent-ish episodes from founder rotation list — refreshed manually. */
const GENERAL_PODCAST_CATALOG: Record<
  GeneralPodcastSource,
  RecoveryContentItem[]
> = {
  indicator: [
    {
      id: "ind-jobs-report-aug",
      kind: "podcast",
      show: "The Indicator from Planet Money",
      title: "Making sense of the jobs report",
      blurb: "Quick econ signal — what the numbers mean for your week.",
      url: "https://podcasts.apple.com/us/podcast/the-indicator-from-planet-money/id1320118593",
      durationMin: 12,
    },
    {
      id: "ind-inflation-cool",
      kind: "podcast",
      show: "The Indicator from Planet Money",
      title: "Is inflation finally cooling off?",
      blurb: "Five minutes on prices, policy, and what to watch.",
      url: "https://podcasts.apple.com/us/podcast/the-indicator-from-planet-money/id1320118593",
      durationMin: 11,
    },
  ],
  "planet-money": [
    {
      id: "pm-tariffs-trade",
      kind: "podcast",
      show: "Planet Money",
      title: "Tariffs, trade, and your wallet",
      blurb: "How global trade fights show up in everyday costs.",
      url: "https://podcasts.apple.com/us/podcast/planet-money/id290783428",
      durationMin: 28,
    },
    {
      id: "pm-housing-math",
      kind: "podcast",
      show: "Planet Money",
      title: "The math behind housing prices",
      blurb: "Supply, demand, and why rent keeps winning.",
      url: "https://podcasts.apple.com/us/podcast/planet-money/id290783428",
      durationMin: 32,
    },
  ],
  "theo-von": [
    {
      id: "tpw-comedian-friend",
      kind: "podcast",
      show: "This Past Weekend w/ Theo Von",
      title: "Stories from the road",
      blurb: "Theo riffing with a friend — loose, funny, human.",
      url: "https://podcasts.apple.com/us/podcast/this-past-weekend-w-theo-von/id1096166537",
      durationMin: 78,
    },
    {
      id: "tpw-growth-grit",
      kind: "podcast",
      show: "This Past Weekend w/ Theo Von",
      title: "On change, chaos, and showing up",
      blurb: "Long-form conversation — not polished, very real.",
      url: "https://podcasts.apple.com/us/podcast/this-past-weekend-w-theo-von/id1096166537",
      durationMin: 84,
    },
  ],
  "prof-g": [
    {
      id: "pg-ai-jobs",
      kind: "podcast",
      show: "The Prof G Pod",
      title: "AI, jobs, and the next economy",
      blurb: "Scott Galloway on where work and wealth are heading.",
      url: "https://podcasts.apple.com/us/podcast/the-prof-g-pod/id1526010674",
      durationMin: 45,
    },
    {
      id: "pg-markets-week",
      kind: "podcast",
      show: "Pivot",
      title: "Markets, tech, and the week that was",
      blurb: "Kara and Scott on the stories that matter for operators.",
      url: "https://podcasts.apple.com/us/podcast/pivot/id1073226719",
      durationMin: 52,
    },
  ],
  "nfl-today": [
    {
      id: "nfl-today-preview",
      kind: "podcast",
      show: "NFL Today",
      title: "Week preview — storylines to watch",
      blurb: "Quick hits before the slate — injuries, matchups, momentum.",
      url: "https://podcasts.apple.com/us/podcast/nfl-today/id1237110309",
      durationMin: 35,
    },
    {
      id: "nfl-today-recap",
      kind: "podcast",
      show: "NFL Today",
      title: "Sunday recap — winners, losers, surprises",
      blurb: "What actually happened and what it means going forward.",
      url: "https://podcasts.apple.com/us/podcast/nfl-today/id1237110309",
      durationMin: 40,
    },
  ],
};

export function dateSeed(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return y * 372 + m * 31 + d;
}

export function pickGeneralSourcesForDay(
  date: string,
): [GeneralPodcastSource, GeneralPodcastSource] {
  const seed = dateSeed(date);
  const first = seed % GENERAL_SOURCES.length;
  let second = (seed + 2) % GENERAL_SOURCES.length;
  if (second === first) {
    second = (first + 1) % GENERAL_SOURCES.length;
  }
  return [GENERAL_SOURCES[first], GENERAL_SOURCES[second]];
}

function pickRecoveryForDay(
  date: string,
  listenedIds: string[] | undefined,
): RecoveryContentItem {
  const heard = new Set(listenedIds ?? []);
  const pool = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "podcast");
  const unheard = pool.filter((i) => !heard.has(i.id));
  const source = unheard.length > 0 ? unheard : pool;
  return source[dateSeed(date) % source.length];
}

function pickGeneralForSource(
  source: GeneralPodcastSource,
  date: string,
  listenedIds: string[] | undefined,
): RecoveryContentItem {
  const heard = new Set(listenedIds ?? []);
  const pool = GENERAL_PODCAST_CATALOG[source];
  const unheard = pool.filter((i) => !heard.has(i.id));
  const sourcePool = unheard.length > 0 ? unheard : pool;
  return sourcePool[(dateSeed(date) + source.length) % sourcePool.length];
}

/** One recovery podcast + two rotating general podcasts for the calendar day. */
export function pickTodaysContent(
  date: string,
  listenedIds?: string[],
): DailyContentItem[] {
  const [sourceA, sourceB] = pickGeneralSourcesForDay(date);
  return [
    { ...pickRecoveryForDay(date, listenedIds), slot: "recovery" },
    {
      ...pickGeneralForSource(sourceA, date, listenedIds),
      slot: "general",
      sourceKey: sourceA,
    },
    {
      ...pickGeneralForSource(sourceB, date, listenedIds),
      slot: "general",
      sourceKey: sourceB,
    },
  ];
}

/** @deprecated RecoveryPodcastCard — kept for digest compatibility */
export { pickRecoveryOffers };
