// Simple file-backed JSON store. This keeps the starter app dependency-free
// (no database to provision) while still persisting data across requests and
// dev-server reloads. Swap this module out for a real database when needed.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { User } from "./incentives";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

type DB = { users: Record<string, User> };

async function readDb(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    return { users: {} };
  }
}

async function writeDb(db: DB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function createUser(name: string, goal: string): Promise<User> {
  const db = await readDb();
  const id = randomUUID();
  const user: User = {
    id,
    name,
    goal,
    createdAt: new Date().toISOString(),
    points: 0,
    streak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    checkIns: [],
    redemptions: [],
  };
  db.users[id] = user;
  await writeDb(db);
  return user;
}

export async function getUser(id: string): Promise<User | null> {
  const db = await readDb();
  return db.users[id] ?? null;
}

export async function saveUser(user: User): Promise<void> {
  const db = await readDb();
  db.users[user.id] = user;
  await writeDb(db);
}
