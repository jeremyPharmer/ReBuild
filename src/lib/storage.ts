import { kv } from "@vercel/kv";
import { head, put } from "@vercel/blob";
import {
  readBytes as readLocalBytes,
  readText as readLocalText,
  writeBytes as writeLocalBytes,
  writeText as writeLocalText,
  useBlobStorage,
  useKvStorage,
} from "./storage-local";

export {
  DATA_DIR,
  useBlobStorage,
  useKvStorage,
} from "./storage-local";

const DB_KV_KEY = "jeremyos:db";

/** Read db.json — KV on Vercel, filesystem locally. */
export async function readDbText(): Promise<string | null> {
  if (useKvStorage()) {
    const raw = await kv.get<string>(DB_KV_KEY);
    return raw ?? null;
  }
  return readLocalText("db.json");
}

/** Write db.json — KV on Vercel, filesystem locally. */
export async function writeDbText(text: string): Promise<void> {
  if (useKvStorage()) {
    await kv.set(DB_KV_KEY, text);
    return;
  }
  await writeLocalText("db.json", text);
}

/** Read a photo blob — Vercel Blob on prod, filesystem locally. */
export async function readPhotoBytes(
  relativePath: string,
): Promise<Buffer | null> {
  if (useBlobStorage()) {
    try {
      const meta = await head(relativePath);
      const token = process.env.BLOB_READ_WRITE_TOKEN!.trim();
      const res = await fetch(meta.downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
  return readLocalBytes(relativePath);
}

/** Write a photo blob — Vercel Blob on prod, filesystem locally. */
export async function writePhotoBytes(
  relativePath: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  if (useBlobStorage()) {
    await put(relativePath, data, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    });
    return;
  }
  await writeLocalBytes(relativePath, data);
}
