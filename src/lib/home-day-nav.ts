import { addDays, parseDate } from "./journey";

export function homeDayPrimary(viewDate: string, today: string): string {
  if (viewDate === today) return "Today";
  if (viewDate === addDays(today, 1)) return "Tomorrow";
  if (viewDate === addDays(today, -1)) return "Yesterday";
  return parseDate(viewDate).toLocaleDateString("en-US", { weekday: "long" });
}

export function homeDaySecondary(viewDate: string): string {
  return parseDate(viewDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
