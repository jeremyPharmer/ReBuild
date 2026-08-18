export type RecoveryContentKind = "podcast" | "article";

export type RecoveryContentItem = {
  id: string;
  kind: RecoveryContentKind;
  /** Show name for podcasts; publisher for articles */
  show: string;
  title: string;
  blurb: string;
  /** Apple Podcasts episode URL or article URL */
  url: string;
  /** Direct MP3 when available for in-page streaming */
  streamUrl?: string;
  /** Listen minutes, or estimated read minutes for articles */
  durationMin: number;
};

/** @deprecated use RecoveryContentItem */
export type PodcastEpisode = RecoveryContentItem;

const PODCASTS: RecoveryContentItem[] = [
  {
    id: "rr-zac-clark-1005",
    kind: "podcast",
    show: "The Rich Roll Podcast",
    title: "Zac Clark on Getting Sober & Staying That Way",
    blurb: "Willingness, emotional sobriety, and building a life after opioids.",
    url: "https://podcasts.apple.com/us/podcast/the-addict-who-won-the-bachelorette-zac-clark-on/id582272991?i=1000780209163",
    streamUrl:
      "https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/1112/tracking.swap.fm/track/Jv32iq4iq8ayghncEYNR/traffic.megaphone.fm/VAOGC5143592729.mp3",
    durationMin: 143,
  },
  {
    id: "rr-ethan-suplee-918",
    kind: "podcast",
    show: "The Rich Roll Podcast",
    title: "Ethan Suplee on Transformation, Relapse & Change",
    blurb: "Addiction patterns, shame stories, and what lasting change actually takes.",
    url: "https://podcasts.apple.com/us/podcast/ethan-suplee-on-shedding-300-pounds-ditching-drugs/id582272991?i=1000714160129",
    streamUrl:
      "https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/1112/tracking.swap.fm/track/Jv32iq4iq8ayghncEYNR/traffic.megaphone.fm/RRE8254646826.mp3?updated=1751497791",
    durationMin: 136,
  },
  {
    id: "rr-masterclass-644",
    kind: "podcast",
    show: "The Rich Roll Podcast",
    title: "A Masterclass on Addiction & Recovery",
    blurb: "A dense overview of addiction science and the recovery path.",
    url: "https://podcasts.apple.com/us/podcast/a-masterclass-on-addiction-recovery/id582272991?i=1000543036147",
    streamUrl:
      "https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/1112/tracking.swap.fm/track/Jv32iq4iq8ayghncEYNR/traffic.megaphone.fm/RRE5510021252.mp3?updated=1692478929",
    durationMin: 105,
  },
  {
    id: "sh-142-addiction-depression",
    kind: "podcast",
    show: "Making Sense with Sam Harris",
    title: "#142 — Addiction, Depression, and a Meaningful Life",
    blurb: "Meaning, suffering, and how addiction sits inside a life.",
    url: "https://podcasts.apple.com/us/podcast/142-addiction-depression-and-a-meaningful-life/id733163012?i=1000423740390",
    streamUrl:
      "https://traffic.libsyn.com/secure/wakingup/Making_Sense_142_Addiction_Depression_and_a_Meaningful_Life_Paywall_8-6-22.mp3?dest-id=480596",
    durationMin: 48,
  },
  {
    id: "sh-149-problem-of-addiction",
    kind: "podcast",
    show: "Making Sense with Sam Harris",
    title: "#149 — The Problem of Addiction",
    blurb: "A clear look at addiction as a problem of mind and behavior.",
    url: "https://podcasts.apple.com/us/podcast/149-the-problem-of-addiction/id733163012?i=1000431059224",
    streamUrl:
      "https://traffic.libsyn.com/secure/wakingup/Making_Sense_149_The_Problem_of_Addiction_Paywall_8-6-22.mp3?dest-id=480596",
    durationMin: 41,
  },
  {
    id: "re-569-relationship-alcohol",
    kind: "podcast",
    show: "Recovery Elevator",
    title: "RE 569: Change Your Relationship With Alcohol?",
    blurb: "Practical alcohol-recovery community voice — rethink the drink.",
    url: "https://podcasts.apple.com/us/podcast/re-569-change-your-relationship-with-alcohol/id971959728?i=1000744784470",
    streamUrl:
      "https://verifi.podscribe.com/rss/p/pscrb.fm/rss/p/traffic.libsyn.com/secure/recoveryelevator/RE_569_mixdown.mp3?dest-id=246961",
    durationMin: 44,
  },
  {
    id: "re-590-are-you-broken",
    kind: "podcast",
    show: "Recovery Elevator",
    title: "RE 590: Are You Broken?",
    blurb: "Shame vs truth in early and ongoing recovery.",
    url: "https://podcasts.apple.com/us/podcast/re-590-are-you-broken/id971959728?i=1000771655017",
    streamUrl:
      "https://verifi.podscribe.com/rss/p/pscrb.fm/rss/p/traffic.libsyn.com/secure/recoveryelevator/RE_590_mixdown.mp3?dest-id=246961",
    durationMin: 44,
  },
  {
    id: "tsg-comfort-stuck",
    kind: "podcast",
    show: "That Sober Guy Podcast",
    title: "Why Comfort Is Keeping You Stuck",
    blurb: "Practical sobriety — when comfort becomes the cage.",
    url: "https://podcasts.apple.com/us/podcast/why-comfort-is-keeping-you-stuck-trent-williamson/id887845353?i=1000775122035",
    streamUrl:
      "https://pscrb.fm/rss/p/mgln.ai/e/1385/injector.simplecastaudio.com/f677e36a-5596-4eab-842f-8a9baaf70bcf/episodes/b7b4c4ae-3509-44ee-8bf1-69ffcfe8c1cc/audio/128/default.mp3?aid=rss_feed&awCollectionId=f677e36a-5596-4eab-842f-8a9baaf70bcf&awEpisodeId=b7b4c4ae-3509-44ee-8bf1-69ffcfe8c1cc&feed=b73GPwU9",
    durationMin: 57,
  },
  {
    id: "zc-maddi-reese",
    kind: "podcast",
    show: "The Zac Clark Show",
    title: "Maddi Reese — Building a Big Life in Recovery",
    blurb: "Sober since 16 — living large without numbing out.",
    url: "https://podcasts.apple.com/us/podcast/sober-since-16-bravo-star-maddi-reese-on-building-a/id1741605552?i=1000775797060",
    streamUrl: "https://traffic.megaphone.fm/VAOGC4719420555.mp3",
    durationMin: 66,
  },
  {
    id: "re-597-moving-on",
    kind: "podcast",
    show: "Recovery Elevator",
    title: "RE 597: Moving On",
    blurb: "What it means to keep going when the story changes.",
    url: "https://podcasts.apple.com/us/podcast/re-597-moving-on/id971959728?i=1000778512772",
    streamUrl:
      "https://verifi.podscribe.com/rss/p/pscrb.fm/rss/p/traffic.libsyn.com/secure/recoveryelevator/RE_597_mixdown.mp3?dest-id=246961",
    durationMin: 45,
  },
];

/** Free, no-paywall recovery articles (NIH / SAMHSA / NIAAA). */
const ARTICLES: RecoveryContentItem[] = [
  {
    id: "nida-understanding-addiction",
    kind: "article",
    show: "NIDA",
    title: "Understanding Drug Use and Addiction",
    blurb: "Why addiction is a brain disease — and why quitting takes more than willpower.",
    url: "https://nida.nih.gov/publications/drugfacts/understanding-drug-use-addiction",
    durationMin: 8,
  },
  {
    id: "niaaa-treatment-help",
    kind: "article",
    show: "NIAAA",
    title: "Treatment for Alcohol Problems: Finding and Getting Help",
    blurb: "How treatment works, what to expect, and where to start.",
    url: "https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/treatment-alcohol-problems-finding-and-getting-help",
    durationMin: 12,
  },
  {
    id: "samhsa-recovery-support",
    kind: "article",
    show: "SAMHSA",
    title: "Recovery and Recovery Support",
    blurb: "What recovery means, and how peer support keeps people in it.",
    url: "https://www.samhsa.gov/substance-use/recovery",
    durationMin: 6,
  },
  {
    id: "niaaa-rethinking-drinking",
    kind: "article",
    show: "NIAAA",
    title: "Rethinking Drinking",
    blurb: "How much is too much — and tools if you want to cut down or quit.",
    url: "https://rethinkingdrinking.niaaa.nih.gov/",
    durationMin: 10,
  },
  {
    id: "nida-treatment-approaches",
    kind: "article",
    show: "NIDA",
    title: "Treatment Approaches for Drug Addiction",
    blurb: "Medicines, counseling, and why combining them works best.",
    url: "https://nida.nih.gov/research-topics/treatment",
    durationMin: 7,
  },
  {
    id: "nida-cannabis",
    kind: "article",
    show: "NIDA",
    title: "Cannabis (Marijuana)",
    blurb: "What cannabis does to the brain and body, in plain language.",
    url: "https://nida.nih.gov/research-topics/cannabis-marijuana",
    durationMin: 8,
  },
];

export const RECOVERY_CONTENT_CATALOG: RecoveryContentItem[] = [
  ...PODCASTS,
  ...ARTICLES,
];

/** @deprecated use RECOVERY_CONTENT_CATALOG */
export const PODCAST_CATALOG = RECOVERY_CONTENT_CATALOG;

export const CONTENT_OFFER_COUNT = 5;
export const PODCAST_OFFER_COUNT = 3;
export const ARTICLE_OFFER_COUNT = 2;

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function takeFromPool(
  pool: RecoveryContentItem[],
  count: number,
  heard: Set<string>,
  exclude: Set<string>,
  randomize: boolean,
): RecoveryContentItem[] {
  const order = randomize ? shuffleInPlace([...pool]) : [...pool];
  const prefer = order.filter((i) => !exclude.has(i.id) && !heard.has(i.id));
  const heardRest = order.filter((i) => !exclude.has(i.id) && heard.has(i.id));
  const wrap = order.filter((i) => exclude.has(i.id));
  return [...prefer, ...heardRest, ...wrap].slice(0, count);
}

export function pickRecoveryOffers(
  listenedIds: string[] | undefined,
  opts?: { excludeIds?: string[]; shuffle?: boolean },
): RecoveryContentItem[] {
  const heard = new Set(listenedIds ?? []);
  const exclude = new Set(opts?.excludeIds ?? []);
  const randomize = Boolean(opts?.shuffle);
  const podcasts = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "podcast");
  const articles = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "article");
  const picked = [
    ...takeFromPool(podcasts, PODCAST_OFFER_COUNT, heard, exclude, randomize),
    ...takeFromPool(articles, ARTICLE_OFFER_COUNT, heard, exclude, randomize),
  ];
  if (picked.length >= CONTENT_OFFER_COUNT) return picked.slice(0, CONTENT_OFFER_COUNT);
  const have = new Set(picked.map((i) => i.id));
  const fill = takeFromPool(
    RECOVERY_CONTENT_CATALOG,
    CONTENT_OFFER_COUNT,
    heard,
    new Set([...exclude, ...have]),
    randomize,
  );
  return [...picked, ...fill].slice(0, CONTENT_OFFER_COUNT);
}

export function offeredPodcasts(
  listenedIds: string[] | undefined,
): RecoveryContentItem[] {
  return pickRecoveryOffers(listenedIds);
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
