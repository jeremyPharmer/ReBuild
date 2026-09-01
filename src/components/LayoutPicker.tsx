"use client";

import Link from "next/link";
import {
  HOME_LAYOUTS,
  PREVIEW_BLOCK_LABELS,
  type HomeBlockId,
  type HomeLayoutId,
} from "@/lib/home-layouts";
import { useHomeLayout } from "@/components/LayoutProvider";

function Wireframe({
  rows,
  active,
}: {
  rows: HomeBlockId[][];
  active: boolean;
}) {
  return (
    <div
      className={active ? "layout-wireframe layout-wireframe-active" : "layout-wireframe"}
      aria-hidden
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className="layout-wire-row"
          style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
        >
          {row.map((block, j) => (
            <div
              key={`${block}-${j}`}
              className={`layout-wire-block layout-wire-${block}`}
            >
              {PREVIEW_BLOCK_LABELS[block]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function LayoutPicker({ compact = false }: { compact?: boolean }) {
  const { homeLayout, setHomeLayout } = useHomeLayout();
  const options = compact ? HOME_LAYOUTS.slice(0, 4) : HOME_LAYOUTS;

  return (
    <section className="panel layout-picker">
      <p className="eyebrow">Home layout</p>
      <p className="muted" style={{ marginTop: 0, lineHeight: 1.45 }}>
        Structure of Home — not just colors. Saved on this device.{" "}
        <Link href="/layouts" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Open full layout gallery
        </Link>
      </p>
      <div className="layout-picker-grid">
        {options.map((option) => {
          const selected = homeLayout === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={
                selected
                  ? "layout-pick-card layout-pick-card-selected"
                  : "layout-pick-card"
              }
              aria-pressed={selected}
              onClick={() => setHomeLayout(option.id as HomeLayoutId)}
            >
              <Wireframe rows={option.preview} active={selected} />
              <span className="layout-pick-copy">
                <span className="layout-pick-label">{option.label}</span>
                <span className="layout-pick-desc">{option.tagline}</span>
              </span>
              {selected ? (
                <span className="layout-pick-badge">Active</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {compact ? (
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          {HOME_LAYOUTS.length - options.length} more on the gallery →
        </p>
      ) : null}
    </section>
  );
}
