import { describe, expect, it } from "vitest";
import {
  googleCalendarStatus,
  mapGoogleEventsForDay,
  sanitizeGoogleCalendarLink,
} from "./google-calendar";

const TZ = "America/Los_Angeles";

describe("googleCalendarStatus", () => {
  it("reports disconnected without refresh token", () => {
    expect(googleCalendarStatus(undefined)).toEqual({ connected: false });
  });

  it("reports connected with refresh token", () => {
    expect(
      googleCalendarStatus({
        connectedAt: "2026-09-01T00:00:00.000Z",
        accountEmail: "jeremy@epiqscripts.com",
        calendarId: "primary",
        refreshToken: "rt_123",
      }),
    ).toEqual({
      connected: true,
      connectedAt: "2026-09-01T00:00:00.000Z",
      accountEmail: "jeremy@epiqscripts.com",
      calendarId: "primary",
    });
  });
});

describe("sanitizeGoogleCalendarLink", () => {
  it("omits refresh token from public status", () => {
    expect(
      sanitizeGoogleCalendarLink({
        connectedAt: "2026-09-01T00:00:00.000Z",
        calendarId: "primary",
        refreshToken: "secret",
      }),
    ).toEqual({
      connected: true,
      connectedAt: "2026-09-01T00:00:00.000Z",
      calendarId: "primary",
    });
  });
});

describe("mapGoogleEventsForDay", () => {
  it("maps timed Google events onto a local day", () => {
    const events = mapGoogleEventsForDay(
      [
        {
          id: "abc123",
          summary: "Declan meet teacher",
          start: { dateTime: "2026-09-01T20:30:00Z" },
          end: { dateTime: "2026-09-01T21:30:00Z" },
          htmlLink: "https://calendar.google.com/event?eid=abc",
        },
      ],
      "2026-09-01",
      TZ,
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toBe("Declan meet teacher");
    expect(events[0]?.source).toBe("work");
    expect(events[0]?.startTime).toMatch(/1:30/);
  });

  it("skips cancelled events", () => {
    expect(
      mapGoogleEventsForDay(
        [
          {
            id: "x",
            status: "cancelled",
            summary: "Nope",
            start: { dateTime: "2026-09-01T17:00:00Z" },
            end: { dateTime: "2026-09-01T18:00:00Z" },
          },
        ],
        "2026-09-01",
        TZ,
      ),
    ).toHaveLength(0);
  });
});
