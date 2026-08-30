"use client";

import { formatHomeHeaderDate } from "@/lib/journey";

export function HomeDateHeader({ date }: { date: string }) {
  return (
    <header className="home-date-header">
      <h1>{formatHomeHeaderDate(date)}</h1>
    </header>
  );
}
