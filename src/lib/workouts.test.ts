import { describe, expect, it } from "vitest";
import {
  blankActualsFromRoutine,
  buildMonthGrid,
  formatExerciseActualSummary,
  monthWorkoutSummary,
  normalizeExerciseActuals,
  normalizeQuality,
  normalizeRoutines,
  normalizeWorkout,
  parseRoutineSelectValue,
  routineSelectValue,
  routinesForType,
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

describe("routines and actuals", () => {
  const routine = {
    id: "routine_1",
    name: "Upper",
    type: "lift" as const,
    exercises: [
      {
        id: "ex_1",
        name: "Bench",
        sets: 3,
        reps: 8,
        tracksWeight: true,
      },
      {
        id: "ex_2",
        name: "Push-ups",
        sets: 2,
        reps: 12,
        tracksWeight: false,
      },
    ],
    createdAt: "2026-08-30T12:00:00Z",
  };

  it("normalizes routines and filters by type", () => {
    const list = normalizeRoutines([
      routine,
      {
        id: "routine_2",
        name: "Flow",
        type: "stretch",
        exercises: [
          {
            id: "ex_3",
            name: "Hamstring",
            sets: 1,
            reps: 30,
            tracksWeight: false,
          },
        ],
        createdAt: "2026-08-30T12:00:00Z",
      },
    ]);
    expect(routinesForType(list, "lift")).toHaveLength(1);
    expect(routinesForType(list, "lift")[0].name).toBe("Upper");
  });

  it("seeds blank actuals from routine plan", () => {
    const actuals = blankActualsFromRoutine(routine);
    expect(actuals).toHaveLength(2);
    expect(actuals[0].sets).toHaveLength(3);
    expect(actuals[0].sets[0].reps).toBe(8);
    expect(actuals[0].tracksWeight).toBe(true);
    expect(actuals[1].tracksWeight).toBe(false);
    expect(actuals[1].sets[0].weight).toBeUndefined();
  });

  it("formats actual summaries and strips weight when not tracked", () => {
    const actuals = normalizeExerciseActuals([
      {
        exerciseId: "ex_1",
        name: "Bench",
        tracksWeight: true,
        sets: [
          { reps: 8, weight: 135 },
          { reps: 6, weight: 145 },
        ],
      },
      {
        exerciseId: "ex_2",
        name: "Push-ups",
        tracksWeight: false,
        sets: [{ reps: 12, weight: 999 }],
      },
    ]);
    expect(actuals?.[1].sets[0].weight).toBeUndefined();
    expect(formatExerciseActualSummary(actuals)).toContain("Bench 8×135, 6×145");
    expect(formatExerciseActualSummary(actuals)).toContain("Push-ups 12");
  });

  it("parses routine select values", () => {
    expect(parseRoutineSelectValue(routineSelectValue("abc"))).toBe("abc");
    expect(parseRoutineSelectValue("Upper body")).toBeNull();
  });
});
