"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function ScaleInput({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const display =
    step < 1 && !Number.isInteger(value) ? value.toFixed(1) : String(value);
  return (
    <label className="field">
      <span className="field-label">
        {label}
        <strong>{display}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Money({ value }: { value: number }) {
  return (
    <span className="money">
      ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className="btn primary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className="btn secondary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ done, target }: { done: number; target: number }) {
  const pct = target === 0 ? 0 : Math.min(100, (done / target) * 100);
  return (
    <div className="progress-track" aria-hidden>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Sheet({
  label,
  busy,
  onClose,
  children,
}: {
  label: string;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const scrollY = window.scrollY;
    html.classList.add("sheet-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const syncHeight = () => {
      const viewport =
        window.visualViewport?.height ?? window.innerHeight ?? 0;
      const h = Math.round(Math.max(320, Math.min(viewport * 0.94, 720)));
      sheetRef.current?.style.setProperty("--sheet-h", `${h}px`);
    };
    syncHeight();
    window.visualViewport?.addEventListener("resize", syncHeight);
    window.addEventListener("resize", syncHeight);

    return () => {
      html.classList.remove("sheet-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.visualViewport?.removeEventListener("resize", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  function endDrag(clientY: number) {
    if (dragStartY.current == null) return;
    const delta = clientY - dragStartY.current;
    dragStartY.current = null;
    setDragOffset(0);
    if (!busy && delta > 80) onClose();
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => !busy && onClose()}
    >
      <div
        ref={sheetRef}
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={
          dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)` }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-sheet-chrome"
          onTouchStart={(e) => {
            dragStartY.current = e.touches[0]?.clientY ?? null;
          }}
          onTouchMove={(e) => {
            if (dragStartY.current == null) return;
            const y = e.touches[0]?.clientY ?? dragStartY.current;
            setDragOffset(Math.max(0, y - dragStartY.current));
          }}
          onTouchEnd={(e) => {
            endDrag(e.changedTouches[0]?.clientY ?? 0);
          }}
          onTouchCancel={() => {
            dragStartY.current = null;
            setDragOffset(0);
          }}
        >
          <div className="modal-sheet-handle" aria-hidden />
        </div>
        <div className="modal-sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function useToggleSet<T extends string>(initial: T[] = []) {
  const [set, setSet] = useState<Set<T>>(new Set(initial));
  const toggle = (v: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };
  return { set, toggle, values: [...set] };
}
