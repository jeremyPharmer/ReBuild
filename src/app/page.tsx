"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { HomeDateHeader } from "@/components/HomeDateHeader";
import { WeatherBanner } from "@/components/WeatherBanner";
import { TodayRebuildPanel } from "@/components/TodayRebuildPanel";
import { TodaysEntertainmentCard } from "@/components/TodaysEntertainmentCard";
import { MoveHubCard } from "@/components/MoveHubCard";
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
      <WeatherBanner />

      <TodayRebuildPanel />

      <div className="home-card-grid">
        <MoveHubCard />
        <TodaysEntertainmentCard />
      </div>

      <WeekPlanPanel today={today} week={dashboard.week} />
    </main>
  );
}
