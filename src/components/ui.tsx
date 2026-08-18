"use client";

import { useEffect, useState, type ReactNode } from "react";

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
  useEffect(() => {
    const html = document.documentElement;
    const prev = document.body.style.overflow;
    html.classList.add("sheet-open");
    document.body.style.overflow = "hidden";
    return () => {
      html.classList.remove("sheet-open");
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => !busy && onClose()}
    >
      <div
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-sheet-handle" aria-hidden />
        {children}
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
