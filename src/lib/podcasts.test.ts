import { describe, expect, it } from "vitest";
import {
  ARTICLE_OFFER_COUNT,
  CONTENT_OFFER_COUNT,
  PODCAST_OFFER_COUNT,
  RECOVERY_CONTENT_CATALOG,
  pickRecoveryOffers,
} from "./podcasts";

describe("pickRecoveryOffers", () => {
  it("deals 3 podcasts and 2 articles", () => {
    const deal = pickRecoveryOffers([]);
    expect(deal).toHaveLength(CONTENT_OFFER_COUNT);
    expect(deal.filter((i) => i.kind === "podcast")).toHaveLength(
      PODCAST_OFFER_COUNT,
    );
    expect(deal.filter((i) => i.kind === "article")).toHaveLength(
      ARTICLE_OFFER_COUNT,
    );
  });

  it("shuffle recycles a different hand of 5", () => {
    const first = pickRecoveryOffers([]);
    const next = pickRecoveryOffers([], {
      excludeIds: first.map((i) => i.id),
      shuffle: true,
    });
    expect(next).toHaveLength(5);
    expect(next.filter((i) => i.kind === "article")).toHaveLength(2);
    const overlap = next.filter((i) => first.some((f) => f.id === i.id));
    expect(overlap).toHaveLength(0);
  });

  it("skips heard items when unused ones remain", () => {
    const first = pickRecoveryOffers([]);
    const heard = first.map((i) => i.id);
    const next = pickRecoveryOffers(heard);
    expect(next.every((i) => !heard.includes(i.id))).toBe(true);
    expect(next.filter((i) => i.kind === "article")).toHaveLength(2);
  });

  it("catalog has enough free articles to shuffle", () => {
    const articles = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "article");
    expect(articles.length).toBeGreaterThanOrEqual(4);
    expect(articles.every((i) => /^https:\/\//.test(i.url))).toBe(true);
  });
});
