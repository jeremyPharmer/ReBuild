"use client";

import type { ReactNode } from "react";
import { HomeDateHeader } from "@/components/HomeDateHeader";
import { WeatherBanner } from "@/components/WeatherBanner";
import { TodayAgendaCard } from "@/components/TodayAgendaCard";
import { TodayRebuildPanel } from "@/components/TodayRebuildPanel";
import { TodaysEntertainmentCard } from "@/components/TodaysEntertainmentCard";
import { MoveHubCard } from "@/components/MoveHubCard";
import { WeekPlanPanel } from "@/components/WeekPlanPanel";
import { useHomeLayout } from "@/components/LayoutProvider";
import type { HomeLayoutId } from "@/lib/home-layouts";

type WeekRow = {
  type: string;
  label: string;
  done: number;
  target: number;
};

function AgendaBlock() {
  return <TodayAgendaCard />;
}

function HubsPair({ hero }: { hero?: boolean }) {
  return (
    <div className={hero ? "home-card-grid home-hubs-hero" : "home-card-grid"}>
      <MoveHubCard />
      <TodaysEntertainmentCard />
    </div>
  );
}

function HeaderStrip({ date }: { date: string }) {
  return (
    <div className="home-header-strip">
      <HomeDateHeader date={date} />
      <WeatherBanner />
    </div>
  );
}

function EntertainmentRail() {
  return (
    <div className="home-focus-rail">
      <TodaysEntertainmentCard />
    </div>
  );
}

function CommandBoard({
  today,
  week,
}: {
  today: string;
  week: WeekRow[];
}) {
  return (
    <div className="home-command-board">
      <WeekPlanPanel today={today} week={week} />
      <TodaysEntertainmentCard />
    </div>
  );
}

function layoutBody(
  id: HomeLayoutId,
  today: string,
  week: WeekRow[],
): ReactNode {
  switch (id) {
    case "briefing":
      return (
        <>
          <HeaderStrip date={today} />
          <AgendaBlock />
          <div className="home-today-hero">
            <TodayRebuildPanel />
          </div>
          <HubsPair />
          <WeekPlanPanel today={today} week={week} />
        </>
      );
    case "split-day":
      return (
        <>
          <HomeDateHeader date={today} />
          <WeatherBanner />
          <AgendaBlock />
          <div className="home-split-day">
            <div className="home-split-primary">
              <TodayRebuildPanel />
              <MoveHubCard />
            </div>
            <EntertainmentRail />
          </div>
          <WeekPlanPanel today={today} week={week} />
        </>
      );
    case "train-first":
      return (
        <>
          <HomeDateHeader date={today} />
          <WeatherBanner />
          <AgendaBlock />
          <TodayRebuildPanel />
          <div className="home-train-hero">
            <MoveHubCard />
          </div>
          <TodaysEntertainmentCard />
          <WeekPlanPanel today={today} week={week} />
        </>
      );
    case "ritual":
      return (
        <>
          <div className="home-ritual-date">
            <HomeDateHeader date={today} />
          </div>
          <div className="home-ritual-weather">
            <WeatherBanner />
          </div>
          <AgendaBlock />
          <div className="home-ritual-today">
            <TodayRebuildPanel />
          </div>
          <HubsPair />
          <WeekPlanPanel today={today} week={week} />
        </>
      );
    case "command":
      return (
        <>
          <HeaderStrip date={today} />
          <AgendaBlock />
          <div className="home-today-compact">
            <TodayRebuildPanel />
          </div>
          <MoveHubCard />
          <CommandBoard today={today} week={week} />
        </>
      );
    case "wind-down":
      return (
        <>
          <HomeDateHeader date={today} />
          <AgendaBlock />
          <div className="home-wind-hero">
            <TodaysEntertainmentCard />
          </div>
          <TodayRebuildPanel />
          <MoveHubCard />
          <WeekPlanPanel today={today} week={week} />
        </>
      );
    case "dual-pillar":
      return (
        <>
          <HomeDateHeader date={today} />
          <WeatherBanner />
          <AgendaBlock />
          <TodayRebuildPanel />
          <HubsPair hero />
          <WeekPlanPanel today={today} week={week} />
        </>
      );
    case "classic":
    default:
      return (
        <>
          <HomeDateHeader date={today} />
          <WeatherBanner />
          <AgendaBlock />
          <TodayRebuildPanel />
          <HubsPair />
          <WeekPlanPanel today={today} week={week} />
        </>
      );
  }
}

export function HomeShell({
  today,
  week,
}: {
  today: string;
  week: WeekRow[];
}) {
  const { homeLayout } = useHomeLayout();

  return (
    <main
      className={`fade-in home-cos stack home-layout home-layout-${homeLayout}`}
      data-home-layout={homeLayout}
    >
      {layoutBody(homeLayout, today, week)}
    </main>
  );
}
