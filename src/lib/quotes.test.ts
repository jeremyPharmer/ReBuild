import { describe, expect, it } from "vitest";
import {
  MORNING_QUOTES,
  pickMorningQuote,
  type QuoteLogEntry,
} from "./quotes";

describe("pickMorningQuote", () => {
  it("avoids quotes used in the last year", () => {
    const used = MORNING_QUOTES.slice(0, -1).map(
      (q): QuoteLogEntry => ({ quoteId: q.id, usedOn: "2026-07-01" }),
    );
    const pick = pickMorningQuote(used, "2026-08-13");
    expect(pick.id).toBe(MORNING_QUOTES[MORNING_QUOTES.length - 1].id);
  });

  it("recycles oldest when all were used recently", () => {
    const used = MORNING_QUOTES.map(
      (q, i): QuoteLogEntry => ({
        quoteId: q.id,
        usedOn: `2026-01-${String(i + 1).padStart(2, "0")}`,
      }),
    );
    const pick = pickMorningQuote(used, "2026-08-13");
    expect(pick.id).toBe(MORNING_QUOTES[0].id);
  });
});
