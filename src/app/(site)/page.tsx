import type { Metadata } from "next";
import { Hero } from "./_home/Hero";
import { ProductPreview } from "./_home/ProductPreview";
import { Expectations, FinalCta, HowItWorks, Support, TrustStrip, WhoItsFor } from "./_home/sections";
import { Reveal } from "@/components/motion/Reveal";
import { DisplayText } from "@/components/type/DisplayText";
import styles from "./_home/home.module.css";

export const metadata: Metadata = {
  title: { absolute: "DFX · Find the loan route that fits you" },
  description:
    "Answer a few questions about the loan you need, see which routes may fit, and talk to our team only if it helps.",
};

/** Homepage (brief §6): a service promise first, a credible next step last. */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <WhoItsFor />
      <section id="preview" className={styles.section} aria-labelledby="preview-title">
        <div className="container">
          <Reveal className={styles.sectionHead} amount={0.25}>
            <p className={`type-eyebrow ${styles.eyebrow}`}>A look inside</p>
            <h2 id="preview-title" className="type-display-l">
              <DisplayText>See what you’ll be asked, and what you’ll get.</DisplayText>
            </h2>
          </Reveal>
          <ProductPreview />
        </div>
      </section>
      <Expectations />
      <Support />
      <FinalCta />
    </main>
  );
}
