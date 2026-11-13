"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/misc";

/** Client-only so locally saved drafts can be restored without a hydration mismatch. */
export const StorefrontEditorClient = dynamic(() => import("./storefront-editor").then((m) => m.StorefrontEditor), {
  ssr: false,
  loading: () => (
    <div className="grid gap-8 lg:grid-cols-2" aria-busy>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full rounded-[16px]" />
        <Skeleton className="h-72 w-full rounded-[16px]" />
      </div>
      <Skeleton className="hidden h-[32rem] w-full rounded-[20px] md:block" />
    </div>
  ),
});
