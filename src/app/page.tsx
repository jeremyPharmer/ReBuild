"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { HomeDateHeader } from "@/components/HomeDateHeader";
import { TodayRebuildPanel } from "@/components/TodayRebuildPanel";
import { TodaysEntertainmentCard } from "@/components/TodaysEntertainmentCard";
import { GymTrackingCard } from "@/components/GymTrackingCard";
import { WeekPlanPanel } from "@/components/WeekPlanPanel";

export default function HomePage() {
  const { state, dashboard, today } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  if (!state.profile?.onboarded || !dashboard) {
    return null;
  }

  return (
    <main className="fade-in home-cos stack">
      <HomeDateHeader date={today} />

      <TodayRebuildPanel />

      <div className="home-card-grid">
        <TodaysEntertainmentCard />
        <GymTrackingCard />
      </div>

      <WeekPlanPanel today={today} week={dashboard.week} />
    </main>
  );
}
