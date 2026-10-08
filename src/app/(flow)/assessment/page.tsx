import type { Metadata } from "next";
import { Suspense } from "react";
import { StartScreen, StartScreenFromUrl } from "./_components/StartScreen";

export const metadata: Metadata = {
  title: "Start your assessment",
  description: "A few short questions about the loan you need. Review every answer before you send it.",
};

/** A0. The static shell renders without the URL's ?goal=; the client fills it in. */
export default function Page() {
  return (
    <Suspense fallback={<StartScreen goal={null} from={null} />}>
      <StartScreenFromUrl />
    </Suspense>
  );
}
