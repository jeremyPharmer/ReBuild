import { describe, expect, it } from "vitest";
import {
  normalizeIcalUrl,
  parseIcsEventsForDay,
  resolveCalendarFeedUrls,
} from "./work-calendar";

const TZ = "America/Los_Angeles";

describe("normalizeIcalUrl", () => {
  it("converts webcal to https", () => {
    expect(
      normalizeIcalUrl("webcal://p123.icloud.com/published/1/abc"),
    ).toBe("https://p123.icloud.com/published/1/abc");
  });

  it("rejects non-http schemes", () => {
    expect(normalizeIcalUrl("ftp://example.com/cal.ics")).toBeUndefined();
  });

  it("trims empty to undefined", () => {
    expect(normalizeIcalUrl("  ")).toBeUndefined();
  });
});

describe("resolveCalendarFeedUrls", () => {
  it("prefers profile URLs over env", () => {
    expect(
      resolveCalendarFeedUrls(
        {
          personalIcalUrl: "https://icloud.example/personal.ics",
          workIcalUrl: "https://google.example/work.ics",
        },
        "https://env.example/work.ics",
      ),
    ).toEqual({
      personal: "https://icloud.example/personal.ics",
      work: "https://google.example/work.ics",
    });
  });

  it("falls back to env for work", () => {
    expect(
      resolveCalendarFeedUrls({}, "https://env.example/work.ics"),
    ).toEqual({
      personal: undefined,
      work: "https://env.example/work.ics",
    });
  });
});

describe("parseIcsEventsForDay", () => {
  it("parses a timed event on the target day", () => {
    // 2026-09-01 17:00–18:00 UTC = 10:00–11:00 America/Los_Angeles
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:standup-1
DTSTART:20260901T170000Z
DTEND:20260901T180000Z
SUMMARY:Standup
LOCATION:Zoom
END:VEVENT
END:VCALENDAR`;

    const events = parseIcsEventsForDay(ics, "2026-09-01", TZ, "work");
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toBe("Standup");
    expect(events[0]?.allDay).toBeFalsy();
    expect(events[0]?.location).toBe("Zoom");
    expect(events[0]?.source).toBe("work");
    expect(events[0]?.startTime).toMatch(/10:00/);
  });

  it("parses an all-day event", () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:offsite-1
DTSTART;VALUE=DATE:20260902
DTEND;VALUE=DATE:20260903
SUMMARY:Offsite
END:VEVENT
END:VCALENDAR`;

    const events = parseIcsEventsForDay(ics, "2026-09-02", TZ, "personal");
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toBe("Offsite");
    expect(events[0]?.allDay).toBe(true);
    expect(events[0]?.startTime).toBe("All day");
  });

  it("expands a weekly RRULE onto the matching day", () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:weekly-1
DTSTART:20260901T180000Z
DTEND:20260901T190000Z
RRULE:FREQ=WEEKLY;COUNT=4
SUMMARY:Weekly sync
END:VEVENT
END:VCALENDAR`;

    const week1 = parseIcsEventsForDay(ics, "2026-09-01", TZ, "work");
    const week2 = parseIcsEventsForDay(ics, "2026-09-08", TZ, "work");
    const off = parseIcsEventsForDay(ics, "2026-09-02", TZ, "work");
    expect(week1.map((e) => e.title)).toEqual(["Weekly sync"]);
    expect(week2.map((e) => e.title)).toEqual(["Weekly sync"]);
    expect(off).toHaveLength(0);
  });

  it("skips cancelled events", () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:cancel-1
DTSTART:20260901T200000Z
DTEND:20260901T210000Z
SUMMARY:Cancelled meeting
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`;

    expect(parseIcsEventsForDay(ics, "2026-09-01", TZ, "work")).toHaveLength(0);
  });
});
