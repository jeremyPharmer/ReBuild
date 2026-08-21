import { describe, expect, it } from "vitest";
import {
  ARTICLE_OFFER_COUNT,
  CONTENT_OFFER_COUNT,
  PODCAST_OFFER_COUNT,
  RECOVERY_CONTENT_CATALOG,
  pickRecoveryOffers,
  unheardRecoveryCount,
} from "./podcasts";

describe("pickRecoveryOffers", () => {
  it("deals 3 podcasts and 2 articles from a deep catalog", () => {
    const deal = pickRecoveryOffers([]);
    expect(deal).toHaveLength(CONTENT_OFFER_COUNT);
    expect(deal.filter((i) => i.kind === "podcast")).toHaveLength(
      PODCAST_OFFER_COUNT,
    );
    expect(deal.filter((i) => i.kind === "article")).toHaveLength(
      ARTICLE_OFFER_COUNT,
    );
    expect(
      RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "podcast").length,
    ).toBeGreaterThanOrEqual(25);
    expect(
      RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "article").length,
    ).toBeGreaterThanOrEqual(18);
  });

  it("shuffle recycles a different hand of 5", () => {
    const first = pickRecoveryOffers([]);
    const next = pickRecoveryOffers([], {
      excludeIds: first.map((i) => i.id),
      shuffle: true,
    });
    expect(next).toHaveLength(CONTENT_OFFER_COUNT);
    expect(next.filter((i) => i.kind === "podcast")).toHaveLength(
      PODCAST_OFFER_COUNT,
    );
    expect(next.filter((i) => i.kind === "article")).toHaveLength(
      ARTICLE_OFFER_COUNT,
    );
    const overlap = next.filter((i) => first.some((f) => f.id === i.id));
    expect(overlap).toHaveLength(0);
  });

  it("shuffle still deals five after some of the current hand is heard", () => {
    const first = pickRecoveryOffers([]);
    const next = pickRecoveryOffers([first[0].id, first[1].id], {
      excludeIds: first.map((i) => i.id),
      shuffle: true,
    });
    expect(next).toHaveLength(CONTENT_OFFER_COUNT);
    expect(next.every((i) => !first.some((f) => f.id === i.id))).toBe(true);
    expect(next.every((i) => i.id !== first[0].id && i.id !== first[1].id)).toBe(
      true,
    );
  });

  it("never re-offers heard or read items", () => {
    const first = pickRecoveryOffers([]);
    const heard = first.map((i) => i.id);
    const next = pickRecoveryOffers(heard);
    expect(next.every((i) => !heard.includes(i.id))).toBe(true);
    expect(next.length).toBe(CONTENT_OFFER_COUNT);
  });

  it("returns fewer than five when the unheard pool is thin — never wraps to heard", () => {
    const podcasts = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "podcast");
    const articles = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "article");
    // Leave only 1 podcast + 1 article unheard
    const heard = [
      ...podcasts.slice(0, -1).map((i) => i.id),
      ...articles.slice(0, -1).map((i) => i.id),
    ];
    const next = pickRecoveryOffers(heard);
    expect(next).toHaveLength(2);
    expect(next.every((i) => !heard.includes(i.id))).toBe(true);
    expect(unheardRecoveryCount(heard).total).toBe(2);
  });

  it("returns an empty hand when everything has been heard or read", () => {
    const all = RECOVERY_CONTENT_CATALOG.map((i) => i.id);
    expect(pickRecoveryOffers(all)).toEqual([]);
    expect(unheardRecoveryCount(all).total).toBe(0);
  });

  it("catalog has a mixed addiction pool with no government sources", () => {
    const articles = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "article");
    const podcasts = RECOVERY_CONTENT_CATALOG.filter((i) => i.kind === "podcast");
    const articleShows = new Set(articles.map((i) => i.show));
    const podcastShows = new Set(podcasts.map((i) => i.show));
    expect(articles.length).toBeGreaterThanOrEqual(18);
    expect(articleShows.size).toBeGreaterThanOrEqual(6);
    expect(podcastShows.size).toBeGreaterThanOrEqual(10);
    expect(articles.every((i) => /^https:\/\//.test(i.url))).toBe(true);
    expect(podcasts.every((i) => /^https:\/\//.test(i.url))).toBe(true);
    expect(articles.every((i) => !/\.gov(\/|$)/i.test(i.url))).toBe(true);
    expect(
      articles.every(
        (i) => !/nida|niaaa|samhsa|nih/i.test(`${i.show} ${i.id} ${i.url}`),
      ),
    ).toBe(true);
    const ids = RECOVERY_CONTENT_CATALOG.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
