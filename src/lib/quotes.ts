/** Morning “Set yourself up” quotes — rotate without reuse for a year. */

export type MorningQuote = {
  id: string;
  text: string;
  attribution: string;
};

export const MORNING_QUOTES: MorningQuote[] = [
  {
    id: "aurelius-1",
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    attribution: "Marcus Aurelius",
  },
  {
    id: "aurelius-2",
    text: "Waste no more time arguing about what a good man should be. Be one.",
    attribution: "Marcus Aurelius",
  },
  {
    id: "aurelius-3",
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    attribution: "Marcus Aurelius",
  },
  {
    id: "epictetus-1",
    text: "It's not what happens to you, but how you react to it that matters.",
    attribution: "Epictetus",
  },
  {
    id: "epictetus-2",
    text: "No man is free who is not master of himself.",
    attribution: "Epictetus",
  },
  {
    id: "epictetus-3",
    text: "First say to yourself what you would be; and then do what you have to do.",
    attribution: "Epictetus",
  },
  {
    id: "watts-1",
    text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    attribution: "Alan Watts",
  },
  {
    id: "watts-2",
    text: "Muddy water is best cleared by leaving it alone.",
    attribution: "Alan Watts",
  },
  {
    id: "watts-3",
    text: "This is the real secret of life — to be completely engaged with what you are doing in the here and now.",
    attribution: "Alan Watts",
  },
  {
    id: "harris-1",
    text: "How we pay attention to the present moment largely determines the character of our experience and, therefore, the quality of our lives.",
    attribution: "Sam Harris",
  },
  {
    id: "harris-2",
    text: "The reality of your life is always now. And to realize this is liberating.",
    attribution: "Sam Harris",
  },
  {
    id: "seneca-1",
    text: "We suffer more often in imagination than in reality.",
    attribution: "Seneca",
  },
  {
    id: "seneca-2",
    text: "Begin at once to live, and count each separate day as a separate life.",
    attribution: "Seneca",
  },
  {
    id: "frankl-1",
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    attribution: "Viktor Frankl",
  },
  {
    id: "rogers-1",
    text: "The curious paradox is that when I accept myself just as I am, then I can change.",
    attribution: "Carl Rogers",
  },
  {
    id: "rumi-1",
    text: "As you start to walk on the way, the way appears.",
    attribution: "Rumi",
  },
  {
    id: "thoreau-1",
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    attribution: "Henry David Thoreau",
  },
  {
    id: "james-1",
    text: "Act as if what you do makes a difference. It does.",
    attribution: "William James",
  },
  {
    id: "confucius-1",
    text: "It does not matter how slowly you go as long as you do not stop.",
    attribution: "Confucius",
  },
  {
    id: "lao-1",
    text: "A journey of a thousand miles begins with a single step.",
    attribution: "Lao Tzu",
  },
  {
    id: "buddha-1",
    text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    attribution: "Buddha",
  },
  {
    id: "emerson-1",
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    attribution: "Ralph Waldo Emerson",
  },
  {
    id: "nietzsche-1",
    text: "He who has a why to live can bear almost any how.",
    attribution: "Friedrich Nietzsche",
  },
  {
    id: "angelou-1",
    text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.",
    attribution: "Maya Angelou",
  },
  {
    id: "camus-1",
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    attribution: "Albert Camus",
  },
];

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type QuoteLogEntry = {
  quoteId: string;
  usedOn: string;
};

export function quoteById(id: string | undefined): MorningQuote | undefined {
  if (!id) return undefined;
  return MORNING_QUOTES.find((q) => q.id === id);
}

/**
 * Pick a quote unused in the last year. If all were used recently,
 * recycle the oldest. Deterministic by `asOfDate` when ties exist.
 */
export function pickMorningQuote(
  log: QuoteLogEntry[] | undefined,
  asOfDate: string,
): MorningQuote {
  const entries = log ?? [];
  const cutoff = new Date(`${asOfDate}T12:00:00`).getTime() - YEAR_MS;
  const recent = new Set(
    entries
      .filter((e) => new Date(`${e.usedOn}T12:00:00`).getTime() >= cutoff)
      .map((e) => e.quoteId),
  );

  const fresh = MORNING_QUOTES.filter((q) => !recent.has(q.id));
  if (fresh.length > 0) {
    const idx =
      Math.abs(
        asOfDate.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
      ) % fresh.length;
    return fresh[idx];
  }

  // Recycle oldest use
  const lastUsed = new Map<string, string>();
  for (const e of entries) {
    const prev = lastUsed.get(e.quoteId);
    if (!prev || e.usedOn > prev) lastUsed.set(e.quoteId, e.usedOn);
  }
  const sorted = [...MORNING_QUOTES].sort((a, b) => {
    const da = lastUsed.get(a.id) ?? "0000-00-00";
    const db = lastUsed.get(b.id) ?? "0000-00-00";
    return da.localeCompare(db) || a.id.localeCompare(b.id);
  });
  return sorted[0];
}
