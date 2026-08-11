"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Plan lives under Settings now. */
export default function PlanRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings");
  }, [router]);
  return null;
}
