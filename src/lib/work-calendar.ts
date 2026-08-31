import {
  fetchAppleCalendarOccurrences,
  isAppleCalendarConnected,
  type AppleCalendarOccurrence,
} from "./apple-calendar";

export type WorkCalendarEvent = {
  id: string;
  title: string;
  /** Local time label, e.g. "9:00 AM"; omit for all-day */
  startTime: string;
  endTime?: string;
  location?: string;
  url?: string;
  calendarName?: string;
  calendarColor?: string;
  allDay?: boolean;
};

/**
 * Work / Apple calendar events for a calendar day.
 * Prefers Apple Calendar ICS feeds (RB-022). See `apple-calendar.ts` for env.
 */
export async function fetchWorkCalendarEvents(
  date: string,
  timeZone = "America/New_York",
): Promise<WorkCalendarEvent[]> {
  if (!isAppleCalendarConnected()) return [];
  const events = await fetchAppleCalendarOccurrences(date, timeZone);
  return events.map(toWorkEvent);
}

function toWorkEvent(e: AppleCalendarOccurrence): WorkCalendarEvent {
  return {
    id: e.id,
    title: e.title,
    startTime: e.startTime ?? "All day",
    endTime: e.endTime ?? undefined,
    location: e.location,
    url: e.url,
    calendarName: e.calendarName,
    calendarColor: e.calendarColor,
    allDay: e.allDay,
  };
}
