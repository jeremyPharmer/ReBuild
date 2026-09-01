import { describe, expect, it } from "vitest";
import {
  applyCalendarTitleOverrides,
  displayCalendarTitle,
  setCalendarTitleOverride,
} from "./calendar-overrides";
import { emptyState } from "./journey";
import type { WorkCalendarEvent } from "./work-calendar";

const sample: WorkCalendarEvent = {
  id: "personal:abc:2026-09-01T16:00:00.000Z",
  title: "9am reese groomer",
  startTime: "9:00 AM",
  endTime: "10:00 AM",
  source: "personal",
};

describe("calendar title overrides", () => {
  it("returns feed title when no override", () => {
    expect(displayCalendarTitle(sample, {})).toBe("9am reese groomer");
  });

  it("uses override when set", () => {
    expect(
      displayCalendarTitle(sample, {
        [sample.id]: "Reese groomer",
      }),
    ).toBe("Reese groomer");
  });

  it("applies overrides to event list", () => {
    const out = applyCalendarTitleOverrides(
      [sample],
      { [sample.id]: "Groomer" },
    );
    expect(out[0]?.title).toBe("Groomer");
  });

  it("sets and clears overrides in state", () => {
    let state = emptyState();
    state = setCalendarTitleOverride(state, sample.id, "Groomer");
    expect(state.calendarTitleOverrides?.[sample.id]).toBe("Groomer");
    state = setCalendarTitleOverride(state, sample.id, "");
    expect(state.calendarTitleOverrides).toBeUndefined();
  });
});
