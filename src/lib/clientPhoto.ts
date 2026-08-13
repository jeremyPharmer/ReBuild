/** Client-side: shrink phone photos so they fit the server photo cap. */

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_TARGET_BYTES = 1.8 * 1024 * 1024;

function dataUrlBytes(dataUrl: string): number {
  const i = dataUrl.indexOf(",");
  if (i < 0) return dataUrl.length;
  const b64 = dataUrl.slice(i + 1);
  return Math.floor((b64.length * 3) / 4);
}

/**
 * Load a File into a canvas, downscale long edge, and export JPEG
 * under ~targetBytes (retries with lower quality / smaller size).
 */
export async function fileToCompressedDataUrl(
  file: File,
  opts?: { maxEdge?: number; targetBytes?: number },
): Promise<string> {
  if (!file.type.startsWith("image/") && file.type !== "") {
    throw new Error("Choose a JPEG, PNG, or similar image");
  }

  const maxEdge = opts?.maxEdge ?? DEFAULT_MAX_EDGE;
  const targetBytes = opts?.targetBytes ?? DEFAULT_TARGET_BYTES;

  const bitmap = await createImageBitmap(file);
  try {
    let edge = maxEdge;
    let dataUrl = "";

    for (let attempt = 0; attempt < 4; attempt++) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not process photo");
      ctx.drawImage(bitmap, 0, 0, w, h);

      let quality = 0.82;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrlBytes(dataUrl) > targetBytes && quality > 0.45) {
        quality -= 0.12;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      if (dataUrlBytes(dataUrl) <= targetBytes) return dataUrl;
      edge = Math.round(edge * 0.7);
    }

    if (!dataUrl || dataUrlBytes(dataUrl) > targetBytes) {
      throw new Error(
        "Photo is still too large — try a screenshot or a lower-res shot",
      );
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
