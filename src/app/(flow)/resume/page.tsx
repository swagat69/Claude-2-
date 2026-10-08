import type { Metadata } from "next";
import { Suspense } from "react";
import { ResumeFromUrl, ResumePending } from "./ResumeScreen";

export const metadata: Metadata = { title: "Open your result" };

/** Signed link from WhatsApp or email. The static shell can't see ?token=, so the client reads it. */
export default function Page() {
  return (
    <Suspense fallback={<ResumePending />}>
      <ResumeFromUrl />
    </Suspense>
  );
}
