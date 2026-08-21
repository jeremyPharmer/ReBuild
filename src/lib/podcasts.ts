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
  {
    id: "hl-lembke-addiction",
    kind: "podcast",
    show: "Huberman Lab",
    title: "Understanding & Treating Addiction | Dr. Anna Lembke",
    blurb: "Dopamine, the pleasure-pain balance, and what a 30-day reset actually does.",
    url: "https://podcasts.apple.com/us/podcast/understanding-treating-addiction-dr-anna-lembke/id1545953110?i=1000532131030",
    durationMin: 120,
  },
  {
    id: "hl-lembke-essentials",
    kind: "podcast",
    show: "Huberman Lab",
    title: "Essentials: Understanding & Treating Addiction | Dr. Anna Lembke",
    blurb: "A tighter cut of Lembke on dopamine, relapse, and recovery tools.",
    url: "https://podcasts.apple.com/us/podcast/essentials-understanding-treating-addiction-dr-anna/id1545953110?i=1000714629702",
    durationMin: 37,
  },
  {
    id: "hl-humphreys-overcome",
    kind: "podcast",
    show: "Huberman Lab",
    title: "How to Overcome Addiction to Substances or Behaviors | Dr. Keith Humphreys",
    blurb: "Alcohol, cannabis, opioids, gambling — genetics, 12-step, and what actually helps.",
    url: "https://podcasts.apple.com/us/podcast/how-to-overcome-addiction-to-substances-or-behaviors/id1545953110?i=1000744781362",
    durationMin: 207,
  },
  {
    id: "pa-lembke-dopamine",
    kind: "podcast",
    show: "The Peter Attia Drive",
    title: "Dopamine and Addiction | Anna Lembke, M.D.",
    blurb: "Deep dive on pleasure-pain, risk factors, and the path from abstinence to recovery.",
    url: "https://podcasts.apple.com/us/podcast/dopamine-and-addiction-navigating-pleasure-pain-and/id1400828889?i=1000672996908",
    durationMin: 142,
  },
  {
    id: "tf-mate-298",
    kind: "podcast",
    show: "The Tim Ferriss Show",
    title: "#298: Dr. Gabor Maté — Redefining Addiction",
    blurb: "Trauma, pain, and why addiction is often an answer — not the question.",
    url: "https://podcasts.apple.com/us/podcast/298-dr-gabor-mate-new-paradigms-ayahuasca-and/id863897795?i=1000403111979",
    durationMin: 151,
  },
  {
    id: "tf-mate-620",
    kind: "podcast",
    show: "The Tim Ferriss Show",
    title: "#620: Dr. Gabor Maté — The Myth of Normal",
    blurb: "Metabolizing anger, processing trauma, and finding the still voice inside.",
    url: "https://podcasts.apple.com/us/podcast/620-dr-gabor-mat%C3%A9-the-myth-of-normal-metabolizing/id863897795?i=1000578709207",
    durationMin: 97,
  },
  {
    id: "rr-lembke-neuroscience",
    kind: "podcast",
    show: "The Rich Roll Podcast",
    title: "Anna Lembke, MD on the Neuroscience of Addiction",
    blurb: "Dopamine fasting, the opioid crisis, and why more never finally feels like enough.",
    url: "https://podcasts.apple.com/us/podcast/anna-lembke-md-on-the-neuroscience-of-addiction/id582272991?i=1000532788012",
    durationMin: 144,
  },
  {
    id: "rr-hari-lost-connections",
    kind: "podcast",
    show: "The Rich Roll Podcast",
    title: "Addiction & Depression: Johann Hari on Lost Connections",
    blurb: "Disconnection as the real driver — and what belonging does instead.",
    url: "https://podcasts.apple.com/us/podcast/addiction-depression-johann-hari-on-lost-connections/id582272991?i=1000427693458",
    durationMin: 131,
  },
  {
    id: "bw-mate-trauma-culture",
    kind: "podcast",
    show: "Being Well",
    title: "Healing Trauma in a Toxic Culture with Dr. Gabor Maté",
    blurb: "How a sick culture shapes addiction — and what healing asks of us.",
    url: "https://podcasts.apple.com/us/podcast/healing-trauma-in-a-toxic-culture-with-dr-gabor-mat%C3%A9/id1120885936?i=1000579181368",
    durationMin: 65,
  },
  {
    id: "ptt-mate-stress",
    kind: "podcast",
    show: "Pulling The Thread",
    title: "When Stress Becomes Illness (Gabor Maté, M.D.)",
    blurb: "Stress, the body, and the pain underneath compulsive patterns.",
    url: "https://podcasts.apple.com/us/podcast/when-stress-becomes-illness-gabor-mat%C3%A9-m-d/id1585015034?i=1000579546204",
    durationMin: 69,
  },
  {
    id: "tnm-one-drink",
    kind: "podcast",
    show: "This Naked Mind Podcast",
    title: "Why One Drink Never Stays One Drink",
    blurb: "Alcohol freedom coaching on the lie of “just one” and how desire actually works.",
    url: "https://podcasts.apple.com/us/podcast/why-one-drink-never-stays-one-drink-alcohol-freedom/id1287269357?i=1000784019244",
    durationMin: 75,
  },
  {
    id: "tnm-judd-25-years",
    kind: "podcast",
    show: "This Naked Mind Podcast",
    title: "Twenty-Five Years Trying to Quit Drinking — Judd’s Naked Life",
    blurb: "A long cycle of almosts — and what finally made quitting stick.",
    url: "https://podcasts.apple.com/us/podcast/twenty-five-years-trying-to-quit-drinking-judds-naked/id1287269357?i=1000783425109",
    durationMin: 48,
  },
  {
    id: "tam-thc-risks",
    kind: "podcast",
    show: "The Addicted Mind Podcast",
    title: "THC Addiction and High-Potency Cannabis",
    blurb: "What stronger cannabis does to dependence risk — without the scare tactics.",
    url: "https://podcasts.apple.com/us/podcast/episode-354-unveiling-the-risks-thc-addiction-and/id1268632042?i=1000730369757",
    durationMin: 35,
  },
  {
    id: "tam-boundaries-113",
    kind: "podcast",
    show: "The Addicted Mind Podcast",
    title: "The 4 Essential Boundaries That Transform Recovery",
    blurb: "Boundaries as recovery infrastructure — not selfishness.",
    url: "https://podcasts.apple.com/us/podcast/tam-ep-113-the-4-essential-boundaries-that-will/id1268632042?i=1000777159891",
    durationMin: 16,
  },
  {
    id: "smart-not-linear",
    kind: "podcast",
    show: "SMART Recovery Podcast",
    title: "Recovery Is Not Always Linear",
    blurb: "Self-management tools for the messy middle — not a perfect streak.",
    url: "https://podcasts.apple.com/us/podcast/recovery-is-not-always-linear/id433764979?i=1000778550664",
    durationMin: 35,
  },
  {
    id: "smart-cast-vision",
    kind: "podcast",
    show: "SMART Recovery Podcast",
    title: "Cast Your Vision to the Future",
    blurb: "Build toward the life you want — not only away from the substance.",
    url: "https://podcasts.apple.com/us/podcast/cast-your-vision-to-the-future/id433764979?i=1000782768015",
    durationMin: 29,
  },
  {
    id: "asgg-time-to-stop",
    kind: "podcast",
    show: "A Sober Girls Guide Podcast",
    title: "Am I Drinking Too Much? How Do You Know It’s Time to Stop",
    blurb: "Practical signals that “fine” has quietly become a problem.",
    url: "https://podcasts.apple.com/us/podcast/am-i-drinking-too-much-how-do-you-know-its-time-to/id1402329684?i=1000736271435",
    durationMin: 43,
  },
  {
    id: "asgg-corrina-confidence",
    kind: "podcast",
    show: "A Sober Girls Guide Podcast",
    title: "Corrina Dunne: How Sobriety Boosts Mental Health & Confidence",
    blurb: "Confidence that doesn’t come from a glass.",
    url: "https://podcasts.apple.com/us/podcast/corrina-dunne-how-sobriety-boosts-mental-health-confidence/id1402329684?i=1000727061106",
    durationMin: 42,
  },
  {
    id: "tbh-early-recovery",
    kind: "podcast",
    show: "The Bubble Hour",
    title: "Voices of Early Recovery",
    blurb: "Women’s stories from the shaky first stretch — honest, not glossy.",
    url: "https://podcasts.apple.com/us/podcast/voices-of-early-recovery/id580501108?i=1000426790292",
    durationMin: 42,
  },
  {
    id: "tbh-kelly",
    kind: "podcast",
    show: "The Bubble Hour",
    title: "Kelly’s Story",
    blurb: "One woman’s path out — the details that make early recovery feel real.",
    url: "https://podcasts.apple.com/us/podcast/kellys-story/id580501108?i=1000507342514",
    durationMin: 51,
  },
  {
    id: "zc-neva-coleman",
    kind: "podcast",
    show: "The Zac Clark Show",
    title: "Young Women, Alcoholism & the New Generation of Recovery | Neva Coleman",
    blurb: "A younger recovery voice on alcohol, identity, and starting over.",
    url: "https://podcasts.apple.com/us/podcast/young-women-alcoholism-the-new-generation-of/id1741605552?i=1000778712038",
    durationMin: 79,
  },
  {
    id: "re-041-emotional-sobriety",
    kind: "podcast",
    show: "Recovery Elevator",
    title: "041: Emotional Sobriety and Not Just a Dry Drunk",
    blurb: "Beyond not drinking — learning to feel without numbing.",
    url: "https://podcasts.apple.com/us/podcast/041-emotional-sobriety-and-not-just-a-dry-drunk/id971959728?i=1000358054077",
    durationMin: 43,
  },
  {
    id: "re-166-emotional-muscle",
    kind: "podcast",
    show: "Recovery Elevator",
    title: "RE 166: Building Emotional Muscle",
    blurb: "Practice for the feelings that used to send you straight to a drink.",
    url: "https://podcasts.apple.com/us/podcast/re-166-building-emotional-muscle/id971959728?i=1000409605982",
    durationMin: 43,
  },
  {
    id: "tsg-relapse-symptoms",
    kind: "podcast",
    show: "That Sober Guy Podcast",
    title: "Symptoms Leading to Relapse",
    blurb: "Early warning signs — so you can catch the slide before it becomes a spiral.",
    url: "https://podcasts.apple.com/us/podcast/tsgp-ep51-symptoms-leading-to-relapse/id887845353?i=1000379652803",
    durationMin: 24,
  },
  {
    id: "hb-path-to-enough",
    kind: "podcast",
    show: "Hidden Brain",
    title: "The Path to Enough",
    blurb: "Why “more” keeps winning — and what enough feels like in a loud culture.",
    url: "https://podcasts.apple.com/us/podcast/the-path-to-enough/id1028908750?i=1000741422481",
    durationMin: 92,
  },
  {
    id: "hb-paradox-pleasure",
    kind: "podcast",
    show: "Hidden Brain",
    title: "The Paradox of Pleasure",
    blurb: "When chasing feeling good quietly makes you feel worse.",
    url: "https://podcasts.apple.com/us/podcast/the-paradox-of-pleasure/id1028908750?i=1000740283638",
    durationMin: 51,
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
  {
    id: "atlantic-aa-irrationality",
    kind: "article",
    show: "The Atlantic",
    title: "The Irrationality of Alcoholics Anonymous",
    blurb: "A deep look at what AA gets right, what it misses, and the science of other paths out.",
    url: "https://www.theatlantic.com/magazine/archive/2015/04/the-irrationality-of-alcoholics-anonymous/386255/",
    durationMin: 35,
  },
  {
    id: "atlantic-pot-addicts",
    kind: "article",
    show: "The Atlantic",
    title: "Can You Get Addicted to Pot?",
    blurb: "Invisible cannabis dependence in a culture that still jokes it can’t happen.",
    url: "https://www.theatlantic.com/ideas/archive/2018/08/americas-invisible-pot-addicts/567886/",
    durationMin: 18,
  },
  {
    id: "atlantic-buprenorphine",
    kind: "article",
    show: "The Atlantic",
    title: "Why Has America Ignored Its Best Addiction Treatment?",
    blurb: "Buprenorphine works — stigma and abstinence-only culture still get in the way.",
    url: "https://www.theatlantic.com/health/archive/2025/04/buprenorphine-opioid-addiction/682550/",
    durationMin: 22,
  },
  {
    id: "atlantic-drinking-parents",
    kind: "article",
    show: "The Atlantic",
    title: "The Drinking Culture Parents Pass Down",
    blurb: "How family norms around alcohol quietly shape the next generation’s relationship with it.",
    url: "https://www.theatlantic.com/family/archive/2021/07/drinking-culture-parents/619522/",
    durationMin: 16,
  },
  {
    id: "atlantic-opioid-treatment-2014",
    kind: "article",
    show: "The Atlantic",
    title: "The Unlikely New Treatment for Opioid Addiction",
    blurb: "An early look at approaches that treat opioid use as a medical problem, not a moral one.",
    url: "https://www.theatlantic.com/health/archive/2014/03/the-unlikely-new-treatment-for-opioid-addiction/284509/",
    durationMin: 14,
  },
  {
    id: "atlantic-weed-promises",
    kind: "article",
    show: "The Atlantic",
    title: "Legal Weed Didn’t Deliver on Its Promises",
    blurb: "What legalization changed — and what it didn’t — for people wrestling with cannabis use.",
    url: "https://www.theatlantic.com/ideas/archive/2025/01/marijuana-legalization-drawbacks/681519/",
    durationMin: 18,
  },
  {
    id: "filter-recovery-meaning",
    kind: "article",
    show: "Filter",
    title: "What Should “Recovery” Mean?",
    blurb: "Measuring life by more than consecutive sober days — and why one box doesn’t fit.",
    url: "https://filtermag.org/not-addict%e2%81%a0-recovery-month/",
    durationMin: 11,
  },
  {
    id: "filter-harm-reduction-coexist",
    kind: "article",
    show: "Filter",
    title: "Can Harm Reduction and Abstinence Constructively Co-Exist?",
    blurb: "Two recovery cultures that don’t have to cancel each other out.",
    url: "https://filtermag.org/harm-reduction-abstinence-co-exist/",
    durationMin: 12,
  },
  {
    id: "filter-meth-harm-reduction",
    kind: "article",
    show: "Filter",
    title: "What Recovery From Meth Addiction Taught Me About Harm Reduction",
    blurb: "Tools that kept someone alive on the way to the recovery they actually wanted.",
    url: "https://filtermag.org/meth-recovery-harm-reduction/",
    durationMin: 10,
  },
  {
    id: "filter-shades-sobriety",
    kind: "article",
    show: "Filter",
    title: "Shades of Sobriety",
    blurb: "When recovery isn’t a single clean abstinence story — and still counts.",
    url: "https://filtermag.org/shades-of-sobriety-life-shows-that-recovery-neednt-mean-abstinence/",
    durationMin: 11,
  },
  {
    id: "guardian-mate-trauma-doctor",
    kind: "article",
    show: "The Guardian",
    title: "The Trauma Doctor: Gabor Maté on Happiness, Hope, and Healing",
    blurb: "Don’t ask why the addiction — ask why the pain. A long conversation on healing.",
    url: "https://www.theguardian.com/lifeandstyle/2023/apr/12/the-trauma-doctor-gabor-mate-on-happiness-hope-and-how-to-heal-our-deepest-wounds",
    durationMin: 18,
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

/**
 * Prefer never-heard items not on the current hand.
 * Never returns heard/read ids — no wrap into consumed content.
 * When `recycleExcluded` is true (shuffle), unheard items from the
 * previous hand may return only after the fresh unheard pool is empty.
 */
function takeFromPool(
  pool: RecoveryContentItem[],
  count: number,
  heard: Set<string>,
  exclude: Set<string>,
  randomize: boolean,
  recycleExcluded = false,
): RecoveryContentItem[] {
  if (count <= 0) return [];
  const order = randomize ? shuffleInPlace([...pool]) : [...pool];
  const fresh = order.filter((i) => !heard.has(i.id) && !exclude.has(i.id));
  if (!recycleExcluded || fresh.length >= count) {
    return fresh.slice(0, count);
  }
  const unheardExcluded = order.filter(
    (i) => !heard.has(i.id) && exclude.has(i.id),
  );
  return [...fresh, ...unheardExcluded].slice(0, count);
}

export function unheardRecoveryCount(
  listenedIds: string[] | undefined,
): { podcasts: number; articles: number; total: number } {
  const heard = new Set(listenedIds ?? []);
  let podcasts = 0;
  let articles = 0;
  for (const item of RECOVERY_CONTENT_CATALOG) {
    if (heard.has(item.id)) continue;
    if (item.kind === "podcast") podcasts += 1;
    else articles += 1;
  }
  return { podcasts, articles, total: podcasts + articles };
}

export function pickRecoveryOffers(
  listenedIds: string[] | undefined,
  opts?: { excludeIds?: string[]; shuffle?: boolean },
): RecoveryContentItem[] {
  const heard = new Set(listenedIds ?? []);
  const exclude = new Set(opts?.excludeIds ?? []);
  const randomize = Boolean(opts?.shuffle);
  const recycleExcluded = Boolean(opts?.shuffle);
  const podcasts = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "podcast");
  const articles = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "article");
  const picked = [
    ...takeFromPool(
      podcasts,
      PODCAST_OFFER_COUNT,
      heard,
      exclude,
      randomize,
      recycleExcluded,
    ),
    ...takeFromPool(
      articles,
      ARTICLE_OFFER_COUNT,
      heard,
      exclude,
      randomize,
      recycleExcluded,
    ),
  ];
  if (picked.length >= CONTENT_OFFER_COUNT) {
    return picked.slice(0, CONTENT_OFFER_COUNT);
  }
  const have = new Set(picked.map((i) => i.id));
  const fill = takeFromPool(
    RECOVERY_CONTENT_CATALOG,
    CONTENT_OFFER_COUNT - picked.length,
    heard,
    new Set([...exclude, ...have]),
    randomize,
    false,
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
