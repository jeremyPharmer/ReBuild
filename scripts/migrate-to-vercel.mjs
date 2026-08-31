#!/usr/bin/env node
/**
 * One-time migration: upload local .data/db.json and photos/ to Vercel KV + Blob.
 *
 * Usage:
 *   KV_REST_API_URL=... KV_REST_API_TOKEN=... BLOB_READ_WRITE_TOKEN=... \
 *     node scripts/migrate-to-vercel.mjs [.data-dir]
 *
 * Or export prod db from Fly first:
 *   fly ssh console -a rebuild-prod -C "cat /app/.data/db.json" > .data/db.json
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.argv[2] || path.join(__dirname, "..", ".data");
const dbPath = path.join(dataDir, "db.json");
const photosDir = path.join(dataDir, "photos");

const DB_KV_KEY = "jeremyos:db";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return v;
}

requireEnv("KV_REST_API_URL");
requireEnv("KV_REST_API_TOKEN");
requireEnv("BLOB_READ_WRITE_TOKEN");

async function main() {
  const dbRaw = await fs.readFile(dbPath, "utf8");
  JSON.parse(dbRaw);
  await kv.set(DB_KV_KEY, dbRaw);
  console.log(`Uploaded db.json (${dbRaw.length} bytes) → KV ${DB_KV_KEY}`);

  let photoCount = 0;
  try {
    const files = await fs.readdir(photosDir);
    for (const file of files) {
      const full = path.join(photosDir, file);
      const stat = await fs.stat(full);
      if (!stat.isFile()) continue;
      const buffer = await fs.readFile(full);
      const ext = path.extname(file).slice(1).toLowerCase();
      const contentType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";
      await put(`photos/${file}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType,
      });
      photoCount++;
    }
  } catch (err) {
    if ((err).code !== "ENOENT") throw err;
  }
  console.log(`Uploaded ${photoCount} photo(s) to Blob`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
