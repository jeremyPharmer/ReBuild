export type WorkCalendarEvent = {
  id: string;
  title: string;
  /** Local time label, e.g. "9:00 AM" */
  startTime: string;
  endTime?: string;
  location?: string;
  /** Video call or calendar deep link when available */
  url?: string;
};

/**
 * Work calendar events for a calendar day.
 * v1: stub until Google/Outlook sync (RB-002 / calendar integration).
 * Set WORK_CALENDAR_ICS_URL later to wire real feeds.
 */
export async function fetchWorkCalendarEvents(
  _date: string,
): Promise<WorkCalendarEvent[]> {
  const icsUrl = process.env.WORK_CALENDAR_ICS_URL?.trim();
  if (!icsUrl) return [];
  // ICS parsing deferred — return empty until integration lands.
  return [];
}
