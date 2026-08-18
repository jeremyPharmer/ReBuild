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

/** Two articles per hand, from a mixed addiction pool — no government sources. */
const ARTICLES: RecoveryContentItem[] = [
  {
    id: "guardian-hari-connection",
    kind: "article",
    show: "The Guardian",
    title: "The Opposite of Addiction Isn’t Sobriety — It’s Connection",
    blurb: "Johann Hari on isolation, love, and why connection does more than white-knuckling ever could.",
    url: "https://www.theguardian.com/books/2016/apr/12/johann-hari-chasing-the-scream-war-on-drugs",
    durationMin: 10,
  },
  {
    id: "temper-replaced-drinking-reading",
    kind: "article",
    show: "The Temper",
    title: "How I Replaced Drinking with Reading",
    blurb: "Whenever a craving hit, she opened a book instead — and built a life she wanted to stay in.",
    url: "https://www.thetemper.com/reading/",
    durationMin: 8,
  },
  {
    id: "time-szalavitz-recover",
    kind: "article",
    show: "TIME",
    title: "Rethinking What It Means to Recover from Addiction",
    blurb: "Maia Szalavitz on many roads out — abstinence, medication, moderation, any positive change.",
    url: "https://time.com/6102343/recovering-from-addiction/",
    durationMin: 12,
  },
  {
    id: "re-heartache-to-healing",
    kind: "article",
    show: "Recovery Elevator",
    title: "From Heartache to Healing",
    blurb: "Quitting uncovered everything alcohol had buried. Connection — not willpower — is what held.",
    url: "https://www.recoveryelevator.com/from-heartache-to-healing/",
    durationMin: 9,
  },
  {
    id: "filter-undoing-drugs",
    kind: "article",
    show: "Filter",
    title: "The Untold Story of Harm Reduction",
    blurb: "How people who use drugs built a movement that treats staying alive as the first win.",
    url: "https://filtermag.org/undoing-drugs-szalavitz-harm-reduction/",
    durationMin: 8,
  },
  {
    id: "guardian-mate-trauma",
    kind: "article",
    show: "The Guardian",
    title: "How Dealing With Past Trauma May Be the Key to Breaking Addiction",
    blurb: "Gabor Maté’s question isn’t what you use — it’s what pain the using was trying to soothe.",
    url: "https://www.theguardian.com/lifeandstyle/2018/nov/24/joanna-moorhead-gabriel-mate-trauma-addiction-treat",
    durationMin: 9,
  },
  {
    id: "tnm-alcohol-stopped-optional",
    kind: "article",
    show: "This Naked Mind",
    title: "When Alcohol Stopped Feeling Optional",
    blurb: "She swore she’d never drink like her family. Then she understood why the glass wouldn’t stay down.",
    url: "https://thisnakedmind.com/when-alcohol-stopped-feeling-optional/",
    durationMin: 9,
  },
  {
    id: "temper-kids-mom-who-lives",
    kind: "article",
    show: "The Temper",
    title: "My Kids Will Never Know a Mom Who Drinks",
    blurb: "A mom who quit wine at 30, then learned how to play, camp, and actually be there.",
    url: "https://www.thetemper.com/my-kids-will-never-know-a-mom-who-drinks-but-theyll-know-one-who-lives/",
    durationMin: 10,
  },
  {
    id: "tnm-not-about-willpower",
    kind: "article",
    show: "This Naked Mind",
    title: "Why Quitting Alcohol Wasn’t About Willpower",
    blurb: "Rehab, AA, rules, and shame didn’t stick — until she stopped treating herself as the problem.",
    url: "https://thisnakedmind.com/why-quitting-alcohol-wasnt-about-willpower-gracies-naked-life/",
    durationMin: 12,
  },
  {
    id: "re-staying-hopeful",
    kind: "article",
    show: "Recovery Elevator",
    title: "Staying Hopeful Through This Long Journey",
    blurb: "Two years of almosts, and one Sunday she did something different. A win counted in hours.",
    url: "https://www.recoveryelevator.com/staying-hopeful-through-this-long-journey/",
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
