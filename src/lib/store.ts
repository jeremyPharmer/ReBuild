import { promises as fs } from "fs";
import path from "path";
import { emptyState } from "./journey";
import { normalizeState } from "./fund";
import type { RebuildState } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readState(): Promise<RebuildState> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return normalizeState(JSON.parse(raw) as RebuildState);
  } catch {
    return emptyState();
  }
}

export async function writeState(state: RebuildState): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    DB_PATH,
    JSON.stringify(normalizeState(state), null, 2),
    "utf8",
  );
}

export async function updateState(
  fn: (state: RebuildState) => RebuildState | Promise<RebuildState>,
): Promise<RebuildState> {
  const current = await readState();
  const next = await fn(current);
  await writeState(next);
  return normalizeState(next);
}
