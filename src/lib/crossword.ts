import type { RebuildState } from "./types";

export const CROSSWORD_SIZE = 5;

/** One curated 5×5 mini — `#` = black cell. */
export type MiniCrosswordPuzzle = {
  id: string;
  /** Five strings of length 5; letters = solution, `#` = block */
  rows: [string, string, string, string, string];
  across: { num: number; clue: string }[];
  down: { num: number; clue: string }[];
};

export type CrosswordCell = {
  row: number;
  col: number;
  index: number;
  black: boolean;
  number?: number;
  solution: string;
};

export type CrosswordDayProgress = {
  date: string;
  started: boolean;
  solved: boolean;
  /** Length 25; `""` empty, letter, or `"#"` for black */
  cells: string[];
};

export type DailyCrosswordState = {
  attempts: number;
  completed: number;
  current?: CrosswordDayProgress;
};

/**
 * Hand-authored pack — pattern:
 *   XXXX#
 *   X##X#
 *   XXXX#
 *   X##X#
 *   #####
 * Across on rows 0 & 2; down on cols 0 & 3. Rotate by day-of-year.
 */
export const MINI_CROSSWORDS: MiniCrosswordPuzzle[] = [
  {
    id: "star-sail",
    rows: ["STAR#", "A##O#", "IDEA#", "L##D#", "#####"],
    across: [
      { num: 1, clue: "Night-sky light" },
      { num: 3, clue: "A notion" },
    ],
    down: [
      { num: 1, clue: "Navigate by water" },
      { num: 2, clue: "Path or highway" },
    ],
  },
  {
    id: "soap-sail",
    rows: ["SOAP#", "A##L#", "IDEA#", "L##Y#", "#####"],
    across: [
      { num: 1, clue: "Bar in the shower" },
      { num: 3, clue: "A notion" },
    ],
    down: [
      { num: 1, clue: "Navigate by water" },
      { num: 2, clue: "Have fun" },
    ],
  },
  {
    id: "calm-card",
    rows: ["CALM#", "A##A#", "RAID#", "D##E#", "#####"],
    across: [
      { num: 1, clue: "Peaceful state" },
      { num: 3, clue: "Sudden attack" },
    ],
    down: [
      { num: 1, clue: "Greeting note" },
      { num: 2, clue: "Created or built" },
    ],
  },
  {
    id: "nose-nest",
    rows: ["NOSE#", "E##A#", "SEAS#", "T##T#", "#####"],
    across: [
      { num: 1, clue: "Smell organ" },
      { num: 3, clue: "Oceans" },
    ],
    down: [
      { num: 1, clue: "Bird’s home" },
      { num: 2, clue: "Compass point" },
    ],
  },
  {
    id: "soft-soil",
    rows: ["SOFT#", "O##A#", "IDOL#", "L##E#", "#####"],
    across: [
      { num: 1, clue: "Not hard" },
      { num: 3, clue: "Adored figure" },
    ],
    down: [
      { num: 1, clue: "Dirt for planting" },
      { num: 2, clue: "Story or legend" },
    ],
  },
  {
    id: "kind-kite",
    rows: ["KIND#", "I##I#", "TURN#", "E##E#", "#####"],
    across: [
      { num: 1, clue: "Gentle or nice" },
      { num: 3, clue: "Change direction" },
    ],
    down: [
      { num: 1, clue: "Flying toy" },
      { num: 2, clue: "Eat dinner" },
    ],
  },
  {
    id: "book-bear",
    rows: ["BOOK#", "E##I#", "ANEW#", "R##I#", "#####"],
    across: [
      { num: 1, clue: "Something to read" },
      { num: 3, clue: "Afresh" },
    ],
    down: [
      { num: 1, clue: "Forest animal" },
      { num: 2, clue: "Flightless bird" },
    ],
  },
  {
    id: "wind-wave",
    rows: ["WIND#", "A##O#", "VEST#", "E##E#", "#####"],
    across: [
      { num: 1, clue: "Moving air" },
      { num: 3, clue: "Sleeveless garment" },
    ],
    down: [
      { num: 1, clue: "Ocean swell" },
      { num: 2, clue: "Be excessively fond" },
    ],
  },
  {
    id: "fire-face",
    rows: ["FIRE#", "A##A#", "CART#", "E##S#", "#####"],
    across: [
      { num: 1, clue: "Camp blaze" },
      { num: 3, clue: "Shopping wagon" },
    ],
    down: [
      { num: 1, clue: "Front of the head" },
      { num: 2, clue: "Consumes food" },
    ],
  },
  {
    id: "gold-game",
    rows: ["GOLD#", "A##O#", "MOAN#", "E##E#", "#####"],
    across: [
      { num: 1, clue: "Precious metal" },
      { num: 3, clue: "Sound of complaint" },
    ],
    down: [
      { num: 1, clue: "Sport or contest" },
      { num: 2, clue: "Finished" },
    ],
  },
  {
    id: "rain-road",
    rows: ["RAIN#", "O##E#", "ACRE#", "D##D#", "#####"],
    across: [
      { num: 1, clue: "Weather from clouds" },
      { num: 3, clue: "Plot of land" },
    ],
    down: [
      { num: 1, clue: "Path or highway" },
      { num: 2, clue: "Require" },
    ],
  },
  {
    id: "leaf-lane",
    rows: ["LEAF#", "A##L#", "NOVA#", "E##Y#", "#####"],
    across: [
      { num: 1, clue: "Tree foliage" },
      { num: 3, clue: "Bright star explosion" },
    ],
    down: [
      { num: 1, clue: "Country road" },
      { num: 2, clue: "Strip the skin from" },
    ],
  },
  {
    id: "moon-more",
    rows: ["MOON#", "O##O#", "REST#", "E##E#", "#####"],
    across: [
      { num: 1, clue: "Night light in the sky" },
      { num: 3, clue: "Take a break" },
    ],
    down: [
      { num: 1, clue: "Additional" },
      { num: 2, clue: "Short memo" },
    ],
  },
  {
    id: "path-pale",
    rows: ["PATH#", "A##A#", "LEFT#", "E##E#", "#####"],
    across: [
      { num: 1, clue: "Walking trail" },
      { num: 3, clue: "Opposite of right" },
    ],
    down: [
      { num: 1, clue: "Light in color" },
      { num: 2, clue: "Loathing" },
    ],
  },
];

function dayOfYear(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const start = Date.UTC(y, 0, 0);
  const now = Date.UTC(y, m - 1, d);
  return Math.floor((now - start) / 86_400_000);
}

export function puzzleForDate(date: string): MiniCrosswordPuzzle {
  const pack = MINI_CROSSWORDS;
  const idx = ((dayOfYear(date) % pack.length) + pack.length) % pack.length;
  return pack[idx]!;
}

export function emptyCellsForPuzzle(puzzle: MiniCrosswordPuzzle): string[] {
  const cells: string[] = [];
  for (const row of puzzle.rows) {
    for (const ch of row) {
      cells.push(ch === "#" ? "#" : "");
    }
  }
  return cells;
}

/** Reading-order start numbers for cells that begin an across and/or down. */
export function startNumberMap(
  puzzle: MiniCrosswordPuzzle,
): Map<number, number> {
  const map = new Map<number, number>();
  let next = 1;
  for (let r = 0; r < CROSSWORD_SIZE; r++) {
    for (let c = 0; c < CROSSWORD_SIZE; c++) {
      if (puzzle.rows[r]![c] === "#") continue;
      const isAcross =
        (c === 0 || puzzle.rows[r]![c - 1] === "#") &&
        c + 1 < CROSSWORD_SIZE &&
        puzzle.rows[r]![c + 1] !== "#";
      const isDown =
        (r === 0 || puzzle.rows[r - 1]![c] === "#") &&
        r + 1 < CROSSWORD_SIZE &&
        puzzle.rows[r + 1]![c] !== "#";
      if (!isAcross && !isDown) continue;
      map.set(r * CROSSWORD_SIZE + c, next);
      next += 1;
    }
  }
  return map;
}

export function buildGrid(puzzle: MiniCrosswordPuzzle): CrosswordCell[] {
  const starts = startNumberMap(puzzle);
  const cells: CrosswordCell[] = [];
  for (let row = 0; row < CROSSWORD_SIZE; row++) {
    for (let col = 0; col < CROSSWORD_SIZE; col++) {
      const index = row * CROSSWORD_SIZE + col;
      const ch = puzzle.rows[row]![col]!;
      cells.push({
        row,
        col,
        index,
        black: ch === "#",
        number: starts.get(index),
        solution: ch === "#" ? "#" : ch.toUpperCase(),
      });
    }
  }
  return cells;
}

export function clueStartIndex(
  puzzle: MiniCrosswordPuzzle,
  num: number,
): number | null {
  for (const [index, n] of startNumberMap(puzzle)) {
    if (n === num) return index;
  }
  return null;
}

export function answerAt(
  puzzle: MiniCrosswordPuzzle,
  num: number,
  dir: "across" | "down",
): string {
  const start = clueStartIndex(puzzle, num);
  if (start == null) return "";
  const row = Math.floor(start / CROSSWORD_SIZE);
  const col = start % CROSSWORD_SIZE;
  let out = "";
  if (dir === "across") {
    for (let c = col; c < CROSSWORD_SIZE; c++) {
      const ch = puzzle.rows[row]![c]!;
      if (ch === "#") break;
      out += ch;
    }
  } else {
    for (let r = row; r < CROSSWORD_SIZE; r++) {
      const ch = puzzle.rows[r]![col]!;
      if (ch === "#") break;
      out += ch;
    }
  }
  return out.toUpperCase();
}

export function fillableCount(puzzle: MiniCrosswordPuzzle): number {
  let n = 0;
  for (const row of puzzle.rows) {
    for (const ch of row) if (ch !== "#") n += 1;
  }
  return n;
}

export function filledCount(cells: string[]): number {
  let n = 0;
  for (const ch of cells) {
    if (ch && ch !== "#") n += 1;
  }
  return n;
}

/** Today’s fill % — letters entered ÷ fillable (wrong letters still count). */
export function todayFillPercent(
  puzzle: MiniCrosswordPuzzle,
  cells: string[] | undefined,
): number {
  const total = fillableCount(puzzle);
  if (total === 0) return 0;
  if (!cells?.length) return 0;
  return Math.round((filledCount(cells) / total) * 100);
}

export function isGridSolved(
  puzzle: MiniCrosswordPuzzle,
  cells: string[],
): boolean {
  if (cells.length !== CROSSWORD_SIZE * CROSSWORD_SIZE) return false;
  for (let i = 0; i < cells.length; i++) {
    const row = Math.floor(i / CROSSWORD_SIZE);
    const col = i % CROSSWORD_SIZE;
    const sol = puzzle.rows[row]![col]!;
    if (sol === "#") continue;
    if ((cells[i] || "").toUpperCase() !== sol.toUpperCase()) return false;
  }
  return true;
}

export function normalizeDailyCrossword(
  raw: DailyCrosswordState | undefined,
): DailyCrosswordState {
  return {
    attempts: Math.max(0, Math.floor(raw?.attempts ?? 0)),
    completed: Math.max(0, Math.floor(raw?.completed ?? 0)),
    current: raw?.current
      ? {
          date: raw.current.date,
          started: Boolean(raw.current.started),
          solved: Boolean(raw.current.solved),
          cells: Array.isArray(raw.current.cells)
            ? raw.current.cells.map((c) =>
                c === "#" ? "#" : String(c || "").toUpperCase().slice(0, 1),
              )
            : [],
        }
      : undefined,
  };
}

export function bannerText(
  completed: number,
  attempts: number,
  todayPct: number,
  started: boolean,
): string {
  const frac = `${completed}/${attempts}`;
  if (!started) return `${frac} · —`;
  return `${frac} · ${todayPct}%`;
}

export type CrosswordAction =
  | { action: "start"; date: string }
  | { action: "save"; date: string; cells: string[] }
  | { action: "complete"; date: string; cells?: string[] };

export function applyCrosswordAction(
  state: RebuildState,
  payload: CrosswordAction,
): RebuildState {
  const puzzle = puzzleForDate(payload.date);
  const dc = normalizeDailyCrossword(state.dailyCrossword);
  const sameDay = dc.current?.date === payload.date ? dc.current : undefined;

  if (payload.action === "start") {
    if (sameDay?.started) {
      return { ...state, dailyCrossword: dc };
    }
    const next: DailyCrosswordState = {
      attempts: dc.attempts + 1,
      completed: dc.completed,
      current: {
        date: payload.date,
        started: true,
        solved: false,
        cells: emptyCellsForPuzzle(puzzle),
      },
    };
    return { ...state, dailyCrossword: next };
  }

  if (!sameDay?.started) {
    return { ...state, dailyCrossword: dc };
  }

  const cells = normalizeCells(
    puzzle,
    payload.action === "save"
      ? payload.cells
      : (payload.cells ?? sameDay.cells),
  );

  const solved = isGridSolved(puzzle, cells);
  const wasSolved = sameDay.solved;
  const next: DailyCrosswordState = {
    attempts: dc.attempts,
    completed: !wasSolved && solved ? dc.completed + 1 : dc.completed,
    current: {
      date: payload.date,
      started: true,
      solved: wasSolved || solved,
      cells,
    },
  };
  return { ...state, dailyCrossword: next };
}

function normalizeCells(
  puzzle: MiniCrosswordPuzzle,
  cells: string[],
): string[] {
  const base = emptyCellsForPuzzle(puzzle);
  return base.map((b, i) => {
    if (b === "#") return "#";
    const raw = (cells[i] || "").toUpperCase().replace(/[^A-Z]/g, "");
    return raw.slice(0, 1);
  });
}

/** Validate pack integrity (tests). */
export function assertPuzzleValid(puzzle: MiniCrosswordPuzzle): void {
  if (puzzle.rows.length !== CROSSWORD_SIZE) {
    throw new Error(`${puzzle.id}: need 5 rows`);
  }
  for (const row of puzzle.rows) {
    if (row.length !== CROSSWORD_SIZE) {
      throw new Error(`${puzzle.id}: row length ${row}`);
    }
  }
  const nums = startNumberMap(puzzle);
  for (const c of puzzle.across) {
    if (![...nums.values()].includes(c.num)) {
      throw new Error(`${puzzle.id}: missing across start ${c.num}`);
    }
    const a = answerAt(puzzle, c.num, "across");
    if (a.length < 2) throw new Error(`${puzzle.id}: across ${c.num} short`);
  }
  for (const c of puzzle.down) {
    if (![...nums.values()].includes(c.num)) {
      throw new Error(`${puzzle.id}: missing down start ${c.num}`);
    }
    const a = answerAt(puzzle, c.num, "down");
    if (a.length < 2) throw new Error(`${puzzle.id}: down ${c.num} short`);
  }
}
