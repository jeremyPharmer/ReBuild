import { emptyState } from "./journey";
import { normalizeState } from "./fund";
import {
  getSessionUser,
  refreshSessionCookie,
  requireSessionUser,
} from "./auth";
import {
  findUserById,
  readDb,
  updateDb,
  writeDb,
  type DbRoot,
  type UserRecord,
} from "./db";
import type { RebuildState } from "./types";

export type { DbRoot, UserRecord };

/** Current user's journey state (requires session). */
export async function readState(): Promise<RebuildState> {
  const user = await requireSessionUser();
  return normalizeState(user.state);
}

export async function writeState(state: RebuildState): Promise<void> {
  const user = await requireSessionUser();
  await updateDb((db) => ({
    ...db,
    users: db.users.map((u) =>
      u.id === user.id ? { ...u, state: normalizeState(state) } : u,
    ),
  }));
}

export async function updateState(
  fn: (state: RebuildState) => RebuildState | Promise<RebuildState>,
): Promise<RebuildState> {
  const user = await requireSessionUser();
  let nextState: RebuildState = normalizeState(user.state);
  const db = await updateDb(async (root) => {
    const current = findUserById(root, user.id);
    if (!current) {
      const err = new Error("User not found");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    nextState = normalizeState(await fn(normalizeState(current.state)));
    return {
      ...root,
      users: root.users.map((u) =>
        u.id === user.id ? { ...u, state: nextState } : u,
      ),
    };
  });
  const saved = findUserById(db, user.id);
  return normalizeState(saved?.state ?? nextState);
}

/** Reset only the signed-in user's journey (keeps account). */
export async function resetCurrentUserState(): Promise<RebuildState> {
  const user = await requireSessionUser();
  const empty = emptyState();
  await writeState(empty);
  await refreshSessionCookie({ ...user, state: empty });
  return empty;
}

export async function updateUserRecord(
  userId: string,
  fn: (user: UserRecord) => UserRecord | Promise<UserRecord>,
): Promise<UserRecord> {
  let updated: UserRecord | null = null;
  await updateDb(async (db) => {
    const current = findUserById(db, userId);
    if (!current) {
      const err = new Error("User not found");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    updated = await fn(current);
    return {
      ...db,
      users: db.users.map((u) => (u.id === userId ? updated! : u)),
    };
  });
  return updated!;
}

export async function updateUserStateById(
  userId: string,
  fn: (state: RebuildState) => RebuildState | Promise<RebuildState>,
): Promise<RebuildState> {
  let nextState: RebuildState = emptyState();
  await updateDb(async (db) => {
    const current = findUserById(db, userId);
    if (!current) {
      const err = new Error("User not found");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    nextState = normalizeState(await fn(normalizeState(current.state)));
    return {
      ...db,
      users: db.users.map((u) =>
        u.id === userId ? { ...u, state: nextState } : u,
      ),
    };
  });
  return nextState;
}

export async function listUsers(): Promise<UserRecord[]> {
  const db = await readDb();
  return db.users;
}

export async function tryReadState(): Promise<RebuildState | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return normalizeState(user.state);
}

/** @deprecated use resetCurrentUserState — kept name for reset route */
export { writeDb, readDb };
