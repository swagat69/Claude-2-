import type { Metadata } from "next";
import { PlaceholderPage } from "../_shared/PlaceholderPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms of use for DFX.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PlaceholderPage eyebrow="Legal" title="Terms of use" note="Approved terms of use">
      <p>The terms that apply when you use the DFX website and assessment.</p>
    </PlaceholderPage>
  );
}
