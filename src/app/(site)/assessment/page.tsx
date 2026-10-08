import type { Metadata } from "next";
import { PlaceholderPage } from "../_shared/PlaceholderPage";

export const metadata: Metadata = {
  title: "The assessment starts here",
  description: "Start your loan assessment.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PlaceholderPage eyebrow="Assessment" title="The assessment starts here" note="Assessment screens are designed in Part 4">
      <p>Four short steps: your goal, your situation, your preferences, then a review before anything is sent.</p>
      <p>This page becomes the start screen in the next part of the build.</p>
    </PlaceholderPage>
  );
}
