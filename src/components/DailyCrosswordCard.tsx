"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useEffectEvent,
  type KeyboardEvent,
} from "react";
import { useApp } from "@/components/AppProvider";
import {
  bannerText,
  buildGrid,
  normalizeDailyCrossword,
  puzzleForDate,
  todayFillPercent,
  type CrosswordCell,
} from "@/lib/crossword";

export function DailyCrosswordCard() {
  const { state, today, post } = useApp();
  const puzzle = useMemo(() => puzzleForDate(today), [today]);
  const grid = useMemo(() => buildGrid(puzzle), [puzzle]);
  const dc = normalizeDailyCrossword(state.dailyCrossword);
  const progress =
    dc.current?.date === today ? dc.current : undefined;
  const started = Boolean(progress?.started);
  const solved = Boolean(progress?.solved);

  const [cells, setCells] = useState<string[]>(
    () => progress?.cells ?? grid.map((c) => (c.black ? "#" : "")),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from server when day / progress changes
  useEffect(() => {
    if (progress?.cells?.length) {
      setCells(progress.cells);
    } else {
      setCells(grid.map((c) => (c.black ? "#" : "")));
    }
  }, [today, progress?.date, progress?.started, progress?.solved, grid]);

  const pct = todayFillPercent(puzzle, started ? cells : undefined);
  const banner = bannerText(dc.completed, dc.attempts, pct, started);

  const persist = useEffectEvent(async (nextCells: string[]) => {
    setError("");
    try {
      await post("/api/crossword", {
        action: "save",
        date: today,
        cells: nextCells,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    }
  });

  function queueSave(nextCells: string[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist(nextCells);
    }, 280);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function onStart() {
    setBusy(true);
    setError("");
    try {
      await post("/api/crossword", { action: "start", date: today });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start");
    } finally {
      setBusy(false);
    }
  }

  function focusCell(index: number) {
    if (solved) return;
    const cell = grid[index];
    if (!cell || cell.black) return;
    setSelected(index);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function nextWhite(from: number, dir: 1 | -1): number | null {
    let i = from + dir;
    while (i >= 0 && i < grid.length) {
      if (!grid[i]!.black) return i;
      i += dir;
    }
    return null;
  }

  function applyLetter(letter: string) {
    if (selected == null || solved) return;
    const next = [...cells];
    next[selected] = letter;
    setCells(next);
    queueSave(next);
    const n = nextWhite(selected, 1);
    if (n != null) setSelected(n);
  }

  function onHiddenInput(value: string) {
    const cleaned = value.toUpperCase().replace(/[^A-Z]/g, "");
    if (!cleaned) return;
    applyLetter(cleaned.slice(-1));
    if (inputRef.current) inputRef.current.value = "";
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (selected == null || solved) return;
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const next = [...cells];
      if (next[selected]) {
        next[selected] = "";
        setCells(next);
        queueSave(next);
      } else {
        const prev = nextWhite(selected, -1);
        if (prev != null) {
          next[prev] = "";
          setCells(next);
          setSelected(prev);
          queueSave(next);
        }
      }
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const n = nextWhite(selected, 1);
      if (n != null) setSelected(n);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = nextWhite(selected, -1);
      if (n != null) setSelected(n);
    }
  }

  return (
    <section
      className="home-card home-card-crossword"
      aria-label="Daily crossword"
      style={{ position: "relative" }}
    >
      <div className="home-card-head">
        <p className="home-card-kicker">Daily crossword</p>
        <h2>Today&apos;s puzzle</h2>
        <p className="tiny home-card-sub">
          {solved
            ? "Solved"
            : started
              ? "Chip away — progress saves"
              : "5×5 mini · start when ready"}
        </p>
      </div>

      {!started ? (
        <button
          type="button"
          className="btn primary crossword-start"
          disabled={busy}
          onClick={() => void onStart()}
        >
          {busy ? "Starting…" : "Start today's crossword"}
        </button>
      ) : (
        <>
          <div
            className={`crossword-grid${solved ? " solved" : ""}`}
            role="grid"
            aria-label="Crossword grid"
          >
            {grid.map((cell) => (
              <GridCell
                key={cell.index}
                cell={cell}
                value={cells[cell.index] || ""}
                selected={selected === cell.index}
                solved={solved}
                onSelect={() => focusCell(cell.index)}
              />
            ))}
          </div>

          <input
            ref={inputRef}
            className="crossword-hidden-input"
            aria-label="Type a letter"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            disabled={solved}
            onChange={(e) => onHiddenInput(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <div className="crossword-clues">
            <div>
              <p className="crossword-clue-head">Across</p>
              <ul>
                {puzzle.across.map((c) => (
                  <li key={`a-${c.num}`}>
                    <strong>{c.num}.</strong> {c.clue}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="crossword-clue-head">Down</p>
              <ul>
                {puzzle.down.map((c) => (
                  <li key={`d-${c.num}`}>
                    <strong>{c.num}.</strong> {c.clue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {error ? <p className="error tiny">{error}</p> : null}

      <p className="crossword-banner" aria-live="polite">
        {banner}
      </p>
    </section>
  );
}

function GridCell({
  cell,
  value,
  selected,
  solved,
  onSelect,
}: {
  cell: CrosswordCell;
  value: string;
  selected: boolean;
  solved: boolean;
  onSelect: () => void;
}) {
  if (cell.black) {
    return <div className="crossword-cell black" aria-hidden />;
  }
  return (
    <button
      type="button"
      className={`crossword-cell${selected ? " selected" : ""}${solved ? " done" : ""}`}
      onClick={onSelect}
      aria-label={
        cell.number
          ? `Cell ${cell.number}${value ? `, ${value}` : ""}`
          : value || "Empty cell"
      }
    >
      {cell.number != null ? (
        <span className="crossword-num">{cell.number}</span>
      ) : null}
      <span className="crossword-letter">{value}</span>
    </button>
  );
}
