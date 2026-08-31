import { newId } from "./journey";
import { readPhotoBytes, writePhotoBytes } from "./storage";

/** Soft cap after client shrink; keep in sync with clientPhoto target (~1.2MB). */
const MAX_BYTES = 2.5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function photoRelativePath(photoId: string): string | null {
  if (!/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/i.test(photoId)) return null;
  return `photos/${photoId}`;
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
  const id = `${newId("photo")}.${ext}`;
  const relativePath = photoRelativePath(id);
  if (!relativePath) {
    throw Object.assign(new Error("Could not save photo"), { status: 500 });
  }
  await writePhotoBytes(relativePath, buffer, mime);
  return id;
}

export async function readPhoto(
  photoId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const relativePath = photoRelativePath(photoId);
  if (!relativePath) return null;
  const buffer = await readPhotoBytes(relativePath);
  if (!buffer) return null;
  const ext = photoId.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : "image/jpeg";
  return { buffer, contentType };
}

export function photoUrl(photoId: string | undefined): string | undefined {
  if (!photoId) return undefined;
  return `/api/photos/${encodeURIComponent(photoId)}`;
}
