/** Client-side: shrink phone photos so they fit the server photo cap. */

/** Long-edge start — aggressive enough for 12MP+ iPhone shots. */
const DEFAULT_MAX_EDGE = 1280;
/** Keep well under server 2.5MB (base64 expands ~33%). */
const DEFAULT_TARGET_BYTES = 1.2 * 1024 * 1024;

export function dataUrlBytes(dataUrl: string): number {
  const i = dataUrl.indexOf(",");
  if (i < 0) return dataUrl.length;
  const b64 = dataUrl.slice(i + 1);
  return Math.floor((b64.length * 3) / 4);
}

function isProbablyImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  // iOS Photos often omits MIME; allow by extension / empty type.
  if (file.type === "") return true;
  const name = file.name.toLowerCase();
  return /\.(jpe?g|png|webp|heic|heif|gif|bmp|tiff?)$/i.test(name);
}

/**
 * Decode a File to ImageBitmap. Falls back to HTMLImageElement for
 * HEIC/HEIF and other formats createImageBitmap rejects (common on iPhone).
 */
async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    // Fallback: object URL + <img> (Safari can decode many library HEICs).
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () =>
          reject(
            new Error(
              "Couldn’t read that photo. Try Choose from library, or a JPEG/PNG screenshot.",
            ),
          );
        el.src = url;
      });
      return await createImageBitmap(img);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function drawToJpeg(
  bitmap: ImageBitmap,
  edge: number,
  quality: number,
): string {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process photo");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Load a File into a canvas, downscale long edge, and export JPEG
 * under ~targetBytes (retries with lower quality / smaller size).
 * Tuned for large iPhone library / camera shots.
 */
export async function fileToCompressedDataUrl(
  file: File,
  opts?: { maxEdge?: number; targetBytes?: number },
): Promise<string> {
  if (!isProbablyImage(file)) {
    throw new Error("Choose a JPEG, PNG, HEIC, or similar image");
  }

  const maxEdge = opts?.maxEdge ?? DEFAULT_MAX_EDGE;
  const targetBytes = opts?.targetBytes ?? DEFAULT_TARGET_BYTES;

  const bitmap = await loadBitmap(file);
  try {
    let edge = maxEdge;
    let dataUrl = "";

    for (let attempt = 0; attempt < 6; attempt++) {
      let quality = 0.78;
      dataUrl = drawToJpeg(bitmap, edge, quality);
      while (dataUrlBytes(dataUrl) > targetBytes && quality > 0.35) {
        quality -= 0.1;
        dataUrl = drawToJpeg(bitmap, edge, quality);
      }
      if (dataUrlBytes(dataUrl) <= targetBytes) return dataUrl;
      edge = Math.round(edge * 0.65);
    }

    if (!dataUrl || dataUrlBytes(dataUrl) > targetBytes) {
      throw new Error(
        "Photo is still too large after shrinking — try a screenshot or a smaller crop",
      );
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
