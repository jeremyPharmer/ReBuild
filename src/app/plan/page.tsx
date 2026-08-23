"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Plan lives on Home now. */
export default function PlanRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
