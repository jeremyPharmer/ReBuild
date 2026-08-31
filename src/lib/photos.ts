import { promises as fs } from "fs";
import path from "path";
import { newId } from "./journey";

const DATA_DIR = path.join(process.cwd(), ".data");
const PHOTOS_DIR = path.join(DATA_DIR, "photos");

/** Soft cap after client shrink; keep in sync with clientPhoto target (~1.2MB). */
const MAX_BYTES = 2.5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function photoFilePath(photoId: string): string | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(photoId)) return null;
  // Resolve under photos dir only
  const full = path.join(PHOTOS_DIR, photoId);
  if (!full.startsWith(PHOTOS_DIR)) return null;
  return full;
}

/** Save a data-URL image; returns photo id (filename with extension). */
export async function savePhotoDataUrl(dataUrl: string): Promise<string> {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    dataUrl.trim(),
  );
  if (!match) {
    throw Object.assign(new Error("Photo must be a JPEG, PNG, or WebP image"), {
      status: 400,
    });
  }
  const mime = match[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) {
    throw Object.assign(new Error("Unsupported image type"), { status: 400 });
  }
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw Object.assign(
      new Error(
        "Photo must be under 2.5MB (the app shrinks phone shots automatically — try Choose from library if Take a photo still fails)",
      ),
      { status: 400 },
    );
  }
  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  const id = `${newId("photo")}.${ext}`;
  const dest = path.join(PHOTOS_DIR, id);
  await fs.writeFile(dest, buffer);
  return id;
}

export async function readPhoto(
  photoId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const base = photoId.includes(".") ? photoId : null;
  if (!base || base.includes("..") || base.includes("/")) return null;
  const full = path.join(PHOTOS_DIR, base);
  if (!full.startsWith(PHOTOS_DIR)) return null;
  try {
    const buffer = await fs.readFile(full);
    const ext = path.extname(base).slice(1).toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export function photoUrl(photoId: string | undefined): string | undefined {
  if (!photoId) return undefined;
  return `/api/photos/${encodeURIComponent(photoId)}`;
}
