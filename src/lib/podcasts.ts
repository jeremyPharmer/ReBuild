export type PodcastEpisode = {
  id: string;
  show: string;
  title: string;
  blurb: string;
  /** Apple Podcasts episode URL — opens app on phone when possible */
  appleUrl: string;
  /** Direct MP3 when available for in-page streaming */
  streamUrl?: string;
  durationMin: number;
};

/** Curated recovery-centered episodes. Order = preference weight. */
export const PODCAST_CATALOG: PodcastEpisode[] = [
  {
    id: "rr-zac-clark-1005",
    show: "The Rich Roll Podcast",
    title: "Zac Clark on Getting Sober & Staying That Way",
    blurb: "Willingness, emotional sobriety, and building a life after opioids.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/the-addict-who-won-the-bachelorette-zac-clark-on/id582272991?i=1000780209163",
    streamUrl:
      "https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/1112/tracking.swap.fm/track/Jv32iq4iq8ayghncEYNR/traffic.megaphone.fm/VAOGC5143592729.mp3",
    durationMin: 143,
  },
  {
    id: "rr-ethan-suplee-918",
    show: "The Rich Roll Podcast",
    title: "Ethan Suplee on Transformation, Relapse & Change",
    blurb: "Addiction patterns, shame stories, and what lasting change actually takes.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/ethan-suplee-on-shedding-300-pounds-ditching-drugs/id582272991?i=1000714160129",
    streamUrl:
      "https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/1112/tracking.swap.fm/track/Jv32iq4iq8ayghncEYNR/traffic.megaphone.fm/RRE8254646826.mp3?updated=1751497791",
    durationMin: 136,
  },
  {
    id: "rr-masterclass-644",
    show: "The Rich Roll Podcast",
    title: "A Masterclass on Addiction & Recovery",
    blurb: "A dense overview of addiction science and the recovery path.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/a-masterclass-on-addiction-recovery/id582272991?i=1000543036147",
    streamUrl:
      "https://pdst.fm/e/pscrb.fm/rss/p/mgln.ai/e/1112/tracking.swap.fm/track/Jv32iq4iq8ayghncEYNR/traffic.megaphone.fm/RRE5510021252.mp3?updated=1692478929",
    durationMin: 105,
  },
  {
    id: "sh-142-addiction-depression",
    show: "Making Sense with Sam Harris",
    title: "#142 — Addiction, Depression, and a Meaningful Life",
    blurb: "Meaning, suffering, and how addiction sits inside a life.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/142-addiction-depression-and-a-meaningful-life/id733163012?i=1000423740390",
    streamUrl:
      "https://traffic.libsyn.com/secure/wakingup/Making_Sense_142_Addiction_Depression_and_a_Meaningful_Life_Paywall_8-6-22.mp3?dest-id=480596",
    durationMin: 48,
  },
  {
    id: "sh-149-problem-of-addiction",
    show: "Making Sense with Sam Harris",
    title: "#149 — The Problem of Addiction",
    blurb: "A clear look at addiction as a problem of mind and behavior.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/149-the-problem-of-addiction/id733163012?i=1000431059224",
    streamUrl:
      "https://traffic.libsyn.com/secure/wakingup/Making_Sense_149_The_Problem_of_Addiction_Paywall_8-6-22.mp3?dest-id=480596",
    durationMin: 41,
  },
  {
    id: "re-569-relationship-alcohol",
    show: "Recovery Elevator",
    title: "RE 569: Change Your Relationship With Alcohol?",
    blurb: "Practical alcohol-recovery community voice — rethink the drink.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/re-569-change-your-relationship-with-alcohol/id971959728?i=1000744784470",
    streamUrl:
      "https://verifi.podscribe.com/rss/p/pscrb.fm/rss/p/traffic.libsyn.com/secure/recoveryelevator/RE_569_mixdown.mp3?dest-id=246961",
    durationMin: 44,
  },
  {
    id: "re-590-are-you-broken",
    show: "Recovery Elevator",
    title: "RE 590: Are You Broken?",
    blurb: "Shame vs truth in early and ongoing recovery.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/re-590-are-you-broken/id971959728?i=1000771655017",
    streamUrl:
      "https://verifi.podscribe.com/rss/p/pscrb.fm/rss/p/traffic.libsyn.com/secure/recoveryelevator/RE_590_mixdown.mp3?dest-id=246961",
    durationMin: 44,
  },
  {
    id: "tsg-comfort-stuck",
    show: "That Sober Guy Podcast",
    title: "Why Comfort Is Keeping You Stuck",
    blurb: "Practical sobriety — when comfort becomes the cage.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/why-comfort-is-keeping-you-stuck-trent-williamson/id887845353?i=1000775122035",
    streamUrl:
      "https://pscrb.fm/rss/p/mgln.ai/e/1385/injector.simplecastaudio.com/f677e36a-5596-4eab-842f-8a9baaf70bcf/episodes/b7b4c4ae-3509-44ee-8bf1-69ffcfe8c1cc/audio/128/default.mp3?aid=rss_feed&awCollectionId=f677e36a-5596-4eab-842f-8a9baaf70bcf&awEpisodeId=b7b4c4ae-3509-44ee-8bf1-69ffcfe8c1cc&feed=b73GPwU9",
    durationMin: 57,
  },
  {
    id: "zc-maddi-reese",
    show: "The Zac Clark Show",
    title: "Maddi Reese — Building a Big Life in Recovery",
    blurb: "Sober since 16 — living large without numbing out.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/sober-since-16-bravo-star-maddi-reese-on-building-a/id1741605552?i=1000775797060",
    streamUrl: "https://traffic.megaphone.fm/VAOGC4719420555.mp3",
    durationMin: 66,
  },
  {
    id: "re-597-moving-on",
    show: "Recovery Elevator",
    title: "RE 597: Moving On",
    blurb: "What it means to keep going when the story changes.",
    appleUrl:
      "https://podcasts.apple.com/us/podcast/re-597-moving-on/id971959728?i=1000778512772",
    streamUrl:
      "https://verifi.podscribe.com/rss/p/pscrb.fm/rss/p/traffic.libsyn.com/secure/recoveryelevator/RE_597_mixdown.mp3?dest-id=246961",
    durationMin: 45,
  },
];

export const PODCAST_OFFER_COUNT = 5;

export function offeredPodcasts(listenedIds: string[] | undefined): PodcastEpisode[] {
  const heard = new Set(listenedIds ?? []);
  return PODCAST_CATALOG.filter((e) => !heard.has(e.id)).slice(
    0,
    PODCAST_OFFER_COUNT,
  );
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
