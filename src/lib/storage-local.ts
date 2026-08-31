import { promises as fs } from "fs";
import path from "path";

/** Local dev directory (gitignored). */
export const DATA_DIR = path.join(process.cwd(), ".data");

export function useKvStorage(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL?.trim() &&
      process.env.KV_REST_API_TOKEN?.trim(),
  );
}

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function localPath(relativePath: string): string {
  const full = path.join(DATA_DIR, relativePath);
  const normalized = path.normalize(full);
  if (!normalized.startsWith(path.normalize(DATA_DIR + path.sep))) {
    throw new Error("Invalid storage path");
  }
  return normalized;
}

export async function readBytes(relativePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(localPath(relativePath));
  } catch {
    return null;
  }
}

export async function writeBytes(
  relativePath: string,
  data: Buffer | string,
): Promise<void> {
  const full = localPath(relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
}

export async function readText(relativePath: string): Promise<string | null> {
  const buf = await readBytes(relativePath);
  return buf ? buf.toString("utf8") : null;
}

export async function writeText(relativePath: string, text: string): Promise<void> {
  await writeBytes(relativePath, text);
}
