import { describe, expect, it } from "vitest";
import {
  buildMonthGrid,
  normalizeWorkout,
  summarizeDay,
  weekRunMiles,
} from "./workouts";
import type { WorkoutLog } from "./types";

describe("normalizeWorkout", () => {
  it("defaults legacy rows to weights lift", () => {
    const w = normalizeWorkout({
      id: "1",
      date: "2026-08-30",
      label: "Leg day",
      createdAt: "2026-08-30T12:00:00Z",
    } as WorkoutLog);
    expect(w.category).toBe("lift");
    expect(w.liftType).toBe("weights");
  });

  it("preserves run with distance", () => {
    const w = normalizeWorkout({
      id: "2",
      date: "2026-08-30",
      category: "run",
      label: "Easy 5K",
      distanceMiles: 3.1,
      createdAt: "2026-08-30T12:00:00Z",
    });
    expect(w.category).toBe("run");
    expect(w.liftType).toBeUndefined();
  });
});

describe("buildMonthGrid", () => {
  it("includes all days in August 2026", () => {
    const weeks = buildMonthGrid(2026, 8);
    const flat = weeks.flat().filter(Boolean);
    expect(flat[0]).toBe("2026-08-01");
    expect(flat.at(-1)).toBe("2026-08-31");
  });
});

describe("summarizeDay", () => {
  it("detects run and lift on same day", () => {
    const s = summarizeDay([
      {
        id: "a",
        date: "2026-08-30",
        category: "run",
        label: "Run",
        createdAt: "",
      },
      {
        id: "b",
        date: "2026-08-30",
        category: "lift",
        liftType: "hiit",
        label: "HIIT",
        createdAt: "",
      },
    ]);
    expect(s.hasRun).toBe(true);
    expect(s.hasLift).toBe(true);
    expect(s.liftTypes).toContain("hiit");
  });
});

describe("weekRunMiles", () => {
  it("sums run miles in the anchor week", () => {
    const miles = weekRunMiles(
      [
        {
          id: "1",
          date: "2026-08-30",
          category: "run",
          label: "Run",
          distanceMiles: 3,
          createdAt: "",
        },
        {
          id: "2",
          date: "2026-08-31",
          category: "run",
          label: "Run",
          distanceMiles: 2.5,
          createdAt: "",
        },
        {
          id: "3",
          date: "2026-08-30",
          category: "lift",
          liftType: "weights",
          label: "Lift",
          createdAt: "",
        },
      ],
      "2026-08-30",
    );
    expect(miles).toBe(5.5);
  });
});
