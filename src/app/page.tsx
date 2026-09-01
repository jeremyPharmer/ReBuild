"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { HomeShell } from "@/components/HomeShell";

export default function HomePage() {
  const { state, dashboard, today } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  if (!state.profile?.onboarded || !dashboard) {
    return null;
  }

  return <HomeShell today={today} week={dashboard.week} />;
}
