import { describe, expect, it } from "vitest";
import {
  buildMonthGrid,
  monthWorkoutSummary,
  normalizeQuality,
  normalizeWorkout,
  summarizeDay,
  weekRunMiles,
  weekWorkoutSummary,
} from "./workouts";
import type { WorkoutLog } from "./types";

describe("normalizeWorkout", () => {
  it("defaults legacy rows to lift", () => {
    const w = normalizeWorkout({
      id: "1",
      date: "2026-08-30",
      label: "Leg day",
      createdAt: "2026-08-30T12:00:00Z",
    } as WorkoutLog);
    expect(w.type).toBe("lift");
  });

  it("migrates lift+hiit to hiit type", () => {
    const w = normalizeWorkout({
      id: "1",
      date: "2026-08-30",
      category: "lift",
      liftType: "hiit",
      label: "Tabata",
      createdAt: "2026-08-30T12:00:00Z",
    });
    expect(w.type).toBe("hiit");
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
    expect(w.type).toBe("run");
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
  it("lists all four types on one day", () => {
    const s = summarizeDay([
      {
        id: "a",
        date: "2026-08-30",
        type: "run",
        label: "Run",
        createdAt: "",
      },
      {
        id: "b",
        date: "2026-08-30",
        type: "hiit",
        label: "HIIT",
        createdAt: "",
      },
    ]);
    expect(s.types).toEqual(["run", "hiit"]);
  });
});

describe("weekRunMiles", () => {
  it("sums run miles in the anchor week", () => {
    const miles = weekRunMiles(
      [
        {
          id: "1",
          date: "2026-08-30",
          type: "run",
          label: "Run",
          distanceMiles: 3,
          createdAt: "",
        },
        {
          id: "2",
          date: "2026-08-31",
          type: "run",
          label: "Run",
          distanceMiles: 2.5,
          createdAt: "",
        },
        {
          id: "3",
          date: "2026-08-30",
          type: "lift",
          label: "Lift",
          createdAt: "",
        },
      ],
      "2026-08-30",
    );
    expect(miles).toBe(5.5);
  });
});

describe("weekWorkoutSummary", () => {
  it("counts sessions by type and sums quality points", () => {
    const summary = weekWorkoutSummary(
      [
        {
          id: "1",
          date: "2026-08-30",
          type: "run",
          label: "Run",
          distanceMiles: 3,
          durationMin: 30,
          quality: 4,
          createdAt: "",
        },
        {
          id: "2",
          date: "2026-08-30",
          type: "hiit",
          label: "HIIT",
          durationMin: 20,
          quality: 5,
          createdAt: "",
        },
      ],
      "2026-08-30",
    );
    expect(summary.counts.run).toBe(1);
    expect(summary.counts.hiit).toBe(1);
    expect(summary.runMiles).toBe(3);
    expect(summary.totalMinutes).toBe(50);
    expect(summary.qualityPoints).toBe(9);
  });
});

describe("monthWorkoutSummary", () => {
  it("filters to the selected month", () => {
    const summary = monthWorkoutSummary(
      [
        {
          id: "1",
          date: "2026-08-01",
          type: "stretch",
          label: "Yoga",
          quality: 3,
          createdAt: "",
        },
        {
          id: "2",
          date: "2026-07-31",
          type: "stretch",
          label: "Yoga",
          quality: 5,
          createdAt: "",
        },
      ],
      2026,
      8,
    );
    expect(summary.counts.stretch).toBe(1);
    expect(summary.qualityPoints).toBe(3);
  });
});

describe("normalizeQuality", () => {
  it("clamps to 1–5", () => {
    expect(normalizeQuality(3)).toBe(3);
    expect(normalizeQuality(0)).toBeUndefined();
    expect(normalizeQuality(6)).toBeUndefined();
    expect(normalizeQuality("4")).toBe(4);
  });
});
