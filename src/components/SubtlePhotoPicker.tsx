"use client";

import { useRef, useState } from "react";

/** iPhone Photos: allow HEIC/HEIF + common formats; empty MIME still OK. */
const IMAGE_ACCEPT =
  "image/*,image/heic,image/heif,.heic,.heif,.jpg,.jpeg,.png,.webp";

export function SubtlePhotoPicker({
  preview,
  onPick,
  onClear,
  cameraLabel = "Take a photo · optional",
  libraryLabel = "Choose from library",
}: {
  preview: string | null;
  onPick: (dataUrl: string) => void;
  onClear: () => void;
  cameraLabel?: string;
  libraryLabel?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setLocalError("");
    try {
      const { fileToCompressedDataUrl } = await import("@/lib/clientPhoto");
      const dataUrl = await fileToCompressedDataUrl(file);
      onPick(dataUrl);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not use that photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-subtle">
      {/* Camera — capture hint; iOS may still yield a large HEIC/JPEG */}
      <input
        ref={cameraRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {/* Library — no capture attribute so iPhone Photos picker opens */}
      <input
        ref={libraryRef}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {preview ? (
        <div className="photo-subtle-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Attached preview" />
          <button type="button" className="dismiss-btn" onClick={onClear}>
            Remove
          </button>
        </div>
      ) : (
        <div className="photo-subtle-actions">
          <button
            type="button"
            className="photo-subtle-btn"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
          >
            {busy ? "Preparing photo…" : cameraLabel}
          </button>
          <button
            type="button"
            className="photo-subtle-btn"
            disabled={busy}
            onClick={() => libraryRef.current?.click()}
          >
            {busy ? "Preparing photo…" : libraryLabel}
          </button>
        </div>
      )}
      {localError && <p className="error">{localError}</p>}
    </div>
  );
}
