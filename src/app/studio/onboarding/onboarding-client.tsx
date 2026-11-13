"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/misc";

/** Client-only so locally saved drafts can be restored without a hydration mismatch. */
export const OnboardingFlowClient = dynamic(() => import("./onboarding-flow").then((m) => m.OnboardingFlow), {
  ssr: false,
  loading: () => (
    <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]" aria-busy>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  ),
});
