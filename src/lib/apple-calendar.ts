import ical from "node-ical";
import type { CalendarResponse, VEvent } from "node-ical";

/** One occurrence of a calendar event for a single local day */
export type AppleCalendarOccurrence = {
  /** Stable key: uid + occurrenceDate */
  id: string;
  uid: string;
  occurrenceDate: string;
  title: string;
  /** Local start time label e.g. "9:00 AM"; null for all-day */
  startTime: string | null;
  endTime?: string | null;
  allDay: boolean;
  location?: string;
  description?: string;
  url?: string;
  calendarName: string;
  /** CSS color from feed config or palette */
  calendarColor: string;
  recurring: boolean;
};

export type AppleCalendarFeed = {
  name: string;
  color: string;
  url: string;
};

/** Apple Calendar–style palette when a feed omits a color */
const CALENDAR_PALETTE = [
  "#5AC8FA",
  "#FF9500",
  "#FF2D55",
  "#AF52DE",
  "#34C759",
  "#007AFF",
  "#FFCC00",
  "#8E8E93",
];

/**
 * Feed config from env.
 *
 * `APPLE_CALENDAR_FEEDS` — comma-separated entries:
 *   `Name|#RRGGBB|https://…`  or  `Name|https://…` (color from palette)
 *
 * Fallback: single `WORK_CALENDAR_ICS_URL` or `APPLE_CALENDAR_ICS_URL`
 * with optional `APPLE_CALENDAR_NAME` / `APPLE_CALENDAR_COLOR`.
 *
 * Demo: `APPLE_CALENDAR_DEMO=1` injects an in-memory sample feed (tests / local).
 */
export function getAppleCalendarFeeds(): AppleCalendarFeed[] {
  const raw = process.env.APPLE_CALENDAR_FEEDS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part, index) => parseFeedEntry(part, index))
      .filter((f): f is AppleCalendarFeed => Boolean(f));
  }

  const single =
    process.env.APPLE_CALENDAR_ICS_URL?.trim() ||
    process.env.WORK_CALENDAR_ICS_URL?.trim();
  if (single) {
    return [
      {
        name: process.env.APPLE_CALENDAR_NAME?.trim() || "Calendar",
        color:
          process.env.APPLE_CALENDAR_COLOR?.trim() ||
          CALENDAR_PALETTE[0]!,
        url: single,
      },
    ];
  }

  if (process.env.APPLE_CALENDAR_DEMO === "1") {
    return [
      {
        name: "Personal",
        color: CALENDAR_PALETTE[0]!,
        url: "demo:personal",
      },
      {
        name: "Work",
        color: CALENDAR_PALETTE[5]!,
        url: "demo:work",
      },
    ];
  }

  return [];
}

export function isAppleCalendarConnected(): boolean {
  return getAppleCalendarFeeds().length > 0;
}

function parseFeedEntry(
  part: string,
  index: number,
): AppleCalendarFeed | null {
  const pieces = part.split("|").map((p) => p.trim());
  if (pieces.length === 3) {
    const [name, color, url] = pieces;
    if (!name || !url) return null;
    return {
      name,
      color: color?.startsWith("#") ? color : CALENDAR_PALETTE[index % CALENDAR_PALETTE.length]!,
      url,
    };
  }
  if (pieces.length === 2) {
    const [name, url] = pieces;
    if (!name || !url) return null;
    return {
      name,
      color: CALENDAR_PALETTE[index % CALENDAR_PALETTE.length]!,
      url,
    };
  }
  if (pieces.length === 1 && pieces[0]?.startsWith("http")) {
    return {
      name: "Calendar",
      color: CALENDAR_PALETTE[index % CALENDAR_PALETTE.length]!,
      url: pieces[0],
    };
  }
  return null;
}

/** Local calendar date YYYY-MM-DD for an Instant in a timezone */
export function dateInTz(isoOrDate: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(isoOrDate);
}

export function formatTimeInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function occurrenceId(uid: string, occurrenceDate: string): string {
  return `${uid}|${occurrenceDate}`;
}

/**
 * Fetch and expand events for a local calendar day across configured feeds.
 * Demo feeds (`APPLE_CALENDAR_DEMO=1`) emit events on the requested `date`.
 */
export async function fetchAppleCalendarOccurrences(
  date: string,
  timeZone: string,
): Promise<AppleCalendarOccurrence[]> {
  return fetchAppleCalendarOccurrencesWithDemoDate(date, timeZone);
}

function occurrencesFromCalendar(
  data: CalendarResponse,
  feed: AppleCalendarFeed,
  date: string,
  timeZone: string,
): AppleCalendarOccurrence[] {
  const out: AppleCalendarOccurrence[] = [];
  const rangeStart = startOfLocalDayUtcApprox(date, timeZone);
  const rangeEnd = new Date(rangeStart.getTime() + 36 * 60 * 60 * 1000);

  for (const component of Object.values(data)) {
    if (!component || component.type !== "VEVENT") continue;
    const event = component as VEvent;
    if (!event.uid || !event.start) continue;

    if (event.rrule) {
      try {
        const instances = ical.expandRecurringEvent(event, {
          from: rangeStart,
          to: rangeEnd,
          expandOngoing: true,
        });
        for (const instance of instances) {
          const start = asDate(instance.start);
          if (!start) continue;
          const occurrenceDate = dateInTz(start, timeZone);
          if (occurrenceDate !== date) continue;
          out.push(
            toOccurrence({
              event,
              start,
              end: asDate(instance.end) ?? undefined,
              feed,
              occurrenceDate,
              timeZone,
              recurring: true,
            }),
          );
        }
      } catch (err) {
        console.error(`[apple-calendar] expand failed for ${event.uid}`, err);
      }
      continue;
    }

    const start = asDate(event.start);
    if (!start) continue;
    const allDay = isAllDay(event);
    const occurrenceDate = allDay
      ? civilDateFromAllDay(start)
      : dateInTz(start, timeZone);
    if (occurrenceDate !== date) {
      // Multi-day all-day: exclusive DTEND may span this local/civil date.
      if (!allDay) continue;
      const end = asDate(event.end) ?? start;
      if (!allDayCoversCivilDate(start, end, date)) continue;
    }

    out.push(
      toOccurrence({
        event,
        start,
        end: asDate(event.end) ?? undefined,
        feed,
        occurrenceDate: date,
        timeZone,
        recurring: false,
      }),
    );
  }

  // De-dupe by id (recurring expand + base edge cases)
  const seen = new Set<string>();
  return out.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}

function toOccurrence(args: {
  event: VEvent;
  start: Date;
  end?: Date;
  feed: AppleCalendarFeed;
  occurrenceDate: string;
  timeZone: string;
  recurring: boolean;
}): AppleCalendarOccurrence {
  const { event, start, end, feed, occurrenceDate, timeZone, recurring } = args;
  const allDay = isAllDay(event);
  const description =
    typeof event.description === "string"
      ? event.description.trim() || undefined
      : undefined;
  const location =
    typeof event.location === "string"
      ? event.location.trim() || undefined
      : undefined;
  const url =
    typeof event.url === "string" ? event.url.trim() || undefined : undefined;

  return {
    id: occurrenceId(String(event.uid), occurrenceDate),
    uid: String(event.uid),
    occurrenceDate,
    title: (event.summary && String(event.summary).trim()) || "Untitled",
    startTime: allDay ? null : formatTimeInTz(start, timeZone),
    endTime: allDay || !end ? null : formatTimeInTz(end, timeZone),
    allDay,
    location,
    description,
    url,
    calendarName: feed.name,
    calendarColor: feed.color,
    recurring,
  };
}

function isAllDay(event: VEvent): boolean {
  const start = event.start as Date & { dateOnly?: boolean };
  if (start && typeof start === "object" && start.dateOnly) return true;
  // node-ical may expose datetype
  const typed = event.start as Date & { datetype?: string };
  if (typed?.datetype === "date") return true;
  return false;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Approximate UTC instant for local midnight of `date` in `timeZone`.
 * Good enough as a recurrence expand window start.
 */
function startOfLocalDayUtcApprox(date: string, timeZone: string): Date {
  // Probe noon UTC on that civil date, then back up to local midnight.
  const noonUtc = new Date(`${date}T12:00:00.000Z`);
  const localDate = dateInTz(noonUtc, timeZone);
  // If timezone shifted the civil date, adjust by a day
  let cursor = noonUtc;
  if (localDate !== date) {
    const delta = localDate > date ? -1 : 1;
    cursor = new Date(noonUtc.getTime() + delta * 24 * 60 * 60 * 1000);
  }
  // Binary-ish: find an instant whose local date is `date` and hour is 0
  for (let hour = 0; hour < 48; hour++) {
    const probe = new Date(cursor.getTime() - 12 * 60 * 60 * 1000 + hour * 60 * 60 * 1000);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(probe);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
    if (`${y}-${m}-${d}` === date && h === 0) return probe;
  }
  return new Date(`${date}T00:00:00.000Z`);
}

function allDayCoversCivilDate(
  start: Date,
  end: Date,
  date: string,
): boolean {
  const startDay = civilDateFromAllDay(start);
  const endExclusive = civilDateFromAllDay(end);
  return date >= startDay && date < endExclusive;
}

/** All-day ICS dates are floating civil dates stored at UTC midnight. */
function civilDateFromAllDay(start: Date): string {
  return start.toISOString().slice(0, 10);
}

/** Deterministic sample ICS for demo / tests (relative to "today" via DTSTART dates passed in). */
export function demoIcsFor(url: string, calendarName: string): string {
  // Fixed sample dates — callers in demo mode should use today's date when
  // generating via buildDemoIcsForDate. This path keeps URL-keyed fixtures.
  void calendarName;
  if (url === "demo:work") {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JeremyOS//Demo Work//EN
BEGIN:VEVENT
UID:demo-work-standup@jeremyos
DTSTAMP:20260101T000000Z
DTSTART:20260115T150000Z
DTEND:20260115T153000Z
SUMMARY:Standup
LOCATION:Zoom
DESCRIPTION:Daily standup
END:VEVENT
END:VCALENDAR`;
  }
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JeremyOS//Demo Personal//EN
BEGIN:VEVENT
UID:demo-personal-dentist@jeremyos
DTSTAMP:20260101T000000Z
DTSTART:20260115T180000Z
DTEND:20260115T190000Z
SUMMARY:Dentist
LOCATION:Main St Dental
DESCRIPTION:Cleaning
END:VEVENT
BEGIN:VEVENT
UID:demo-personal-allday@jeremyos
DTSTAMP:20260101T000000Z
DTSTART;VALUE=DATE:20260115
DTEND;VALUE=DATE:20260116
SUMMARY:Trash day
END:VEVENT
END:VCALENDAR`;
}

/**
 * Build demo ICS whose events fall on `date` (YYYY-MM-DD) in `timeZone`.
 * Used when APPLE_CALENDAR_DEMO=1 so Today’s Build always has sample rows.
 */
export function buildDemoIcsForDate(
  kind: "personal" | "work",
  date: string,
  timeZone: string,
): string {
  const morning = localCivilToUtcIso(date, 9, 0, timeZone);
  const morningEnd = localCivilToUtcIso(date, 9, 30, timeZone);
  const afternoon = localCivilToUtcIso(date, 14, 0, timeZone);
  const afternoonEnd = localCivilToUtcIso(date, 15, 0, timeZone);
  const fmt = (iso: string) =>
    iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  if (kind === "work") {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JeremyOS//Demo Work//EN
BEGIN:VEVENT
UID:demo-work-standup@jeremyos
DTSTAMP:${fmt(new Date().toISOString())}
DTSTART:${fmt(morning)}
DTEND:${fmt(morningEnd)}
SUMMARY:Standup
LOCATION:Zoom
DESCRIPTION:Daily standup with the team
URL:https://zoom.us
END:VEVENT
END:VCALENDAR`;
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JeremyOS//Demo Personal//EN
BEGIN:VEVENT
UID:demo-personal-dentist@jeremyos
DTSTAMP:${fmt(new Date().toISOString())}
DTSTART:${fmt(afternoon)}
DTEND:${fmt(afternoonEnd)}
SUMMARY:Dentist
LOCATION:Main St Dental
DESCRIPTION:Cleaning — bring insurance card
END:VEVENT
BEGIN:VEVENT
UID:demo-personal-allday@jeremyos
DTSTAMP:${fmt(new Date().toISOString())}
DTSTART;VALUE=DATE:${date.replace(/-/g, "")}
DTEND;VALUE=DATE:${nextCivilDate(date).replace(/-/g, "")}
SUMMARY:Trash day
END:VEVENT
END:VCALENDAR`;
}

function nextCivilDate(date: string): string {
  const d = new Date(`${date}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Convert local civil date+time in `timeZone` to a UTC ISO string. */
export function localCivilToUtcIso(
  date: string,
  hour: number,
  minute: number,
  timeZone: string,
): string {
  // Guess UTC, then correct using formatter offset
  let guess = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(guess);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const min = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const asLocal = `${y}-${m}-${d}`;
    if (asLocal === date && h === hour && min === minute) {
      return guess.toISOString();
    }
    const desired = Date.parse(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
    const actual = Date.parse(
      `${asLocal}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00.000Z`,
    );
    guess = new Date(guess.getTime() + (desired - actual));
  }
  return guess.toISOString();
}

/** Override demo feed loader to emit events for the requested day. */
export async function fetchAppleCalendarOccurrencesWithDemoDate(
  date: string,
  timeZone: string,
): Promise<AppleCalendarOccurrence[]> {
  const feeds = getAppleCalendarFeeds();
  if (feeds.length === 0) return [];

  const results = await Promise.all(
    feeds.map(async (feed) => {
      try {
        let data: CalendarResponse;
        if (feed.url === "demo:personal") {
          data = ical.parseICS(
            buildDemoIcsForDate("personal", date, timeZone),
          );
        } else if (feed.url === "demo:work") {
          data = ical.parseICS(buildDemoIcsForDate("work", date, timeZone));
        } else if (feed.url.startsWith("demo:")) {
          data = ical.parseICS(demoIcsFor(feed.url, feed.name));
        } else {
          data = await ical.async.fromURL(feed.url);
        }
        return occurrencesFromCalendar(data, feed, date, timeZone);
      } catch (err) {
        console.error(`[apple-calendar] feed "${feed.name}" failed`, err);
        return [] as AppleCalendarOccurrence[];
      }
    }),
  );

  return results
    .flat()
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      const at = a.startTime ?? "";
      const bt = b.startTime ?? "";
      if (at !== bt) return at.localeCompare(bt);
      return a.title.localeCompare(b.title);
    });
}
