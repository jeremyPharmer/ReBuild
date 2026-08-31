import { afterEach, describe, expect, it } from "vitest";
import ical from "node-ical";
import {
  buildDemoIcsForDate,
  dateInTz,
  fetchAppleCalendarOccurrences,
  formatTimeInTz,
  getAppleCalendarFeeds,
  occurrenceId,
} from "./apple-calendar";

describe("apple-calendar", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("parses APPLE_CALENDAR_FEEDS with colors", () => {
    process.env.APPLE_CALENDAR_FEEDS =
      "Personal|#FF9500|https://example.com/a.ics,Work|https://example.com/b.ics";
    delete process.env.APPLE_CALENDAR_ICS_URL;
    delete process.env.WORK_CALENDAR_ICS_URL;
    delete process.env.APPLE_CALENDAR_DEMO;
    const feeds = getAppleCalendarFeeds();
    expect(feeds).toHaveLength(2);
    expect(feeds[0]).toMatchObject({
      name: "Personal",
      color: "#FF9500",
      url: "https://example.com/a.ics",
    });
    expect(feeds[1]?.name).toBe("Work");
    expect(feeds[1]?.color).toMatch(/^#/);
  });

  it("builds occurrence ids from uid + date", () => {
    expect(occurrenceId("abc", "2026-08-31")).toBe("abc|2026-08-31");
  });

  it("demo feed yields timed + all-day events for today", async () => {
    process.env.APPLE_CALENDAR_DEMO = "1";
    delete process.env.APPLE_CALENDAR_FEEDS;
    delete process.env.APPLE_CALENDAR_ICS_URL;
    delete process.env.WORK_CALENDAR_ICS_URL;

    const tz = "America/New_York";
    const date = "2026-08-31";
    const events = await fetchAppleCalendarOccurrences(date, tz);
    expect(events.length).toBeGreaterThanOrEqual(2);
    const titles = events.map((e) => e.title);
    expect(titles).toContain("Standup");
    expect(titles).toContain("Dentist");
    expect(titles).toContain("Trash day");

    const dentist = events.find((e) => e.title === "Dentist");
    expect(dentist?.allDay).toBe(false);
    expect(dentist?.startTime).toBeTruthy();
    expect(dentist?.calendarColor).toMatch(/^#/);
    expect(dentist?.id).toBe(occurrenceId(dentist!.uid, date));

    const trash = events.find((e) => e.title === "Trash day");
    expect(trash?.allDay).toBe(true);
    expect(trash?.startTime).toBeNull();
  });

  it("formats local times", () => {
    const d = new Date("2026-08-31T18:00:00.000Z");
    const label = formatTimeInTz(d, "UTC");
    expect(label).toMatch(/6:00/);
    expect(dateInTz(d, "UTC")).toBe("2026-08-31");
  });

  it("parses demo ICS via node-ical", () => {
    const ics = buildDemoIcsForDate("personal", "2026-08-31", "UTC");
    const data = ical.parseICS(ics);
    const events = Object.values(data).filter(
      (c): c is NonNullable<typeof c> & { type: "VEVENT" } =>
        Boolean(c) && c!.type === "VEVENT",
    );
    expect(events.length).toBe(2);
  });
});
