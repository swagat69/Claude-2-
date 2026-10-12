import type { Metadata } from "next";
import { Hero } from "./_home/Hero";
import { Expectations, FinalCta, HowItWorks, Support, LenderLogos } from "./_home/sections";

export const metadata: Metadata = {
  title: { absolute: "DFX · Explore loan routes in Singapore" },
  description: "Answer questions about your needs, understand possible loan routes, and choose whether to talk with DFX.",
};

export default function HomePage() {
  return <main id="main"><Hero /><LenderLogos /><HowItWorks /><Expectations /><Support /><FinalCta /></main>;
}
