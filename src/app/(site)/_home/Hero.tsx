import { HeroGoals } from "./HeroGoals";
import styles from "./home.module.css";

export function Hero() {
  return <section className={styles.hero} aria-labelledby="hero-title"><div className={`container ${styles.heroGrid}`}>
    <div className={styles.heroCopy}>
      <p className={styles.eyebrow}>Loan options in Singapore</p>
      <h1 id="hero-title">See which loan routes may fit, before you talk to anyone</h1>
      <p className={styles.heroLead}>A few questions about your needs. An explanation of the routes you could explore. You choose what happens next.</p>
      <p className={styles.serviceNote}>DFX is a loan-matching service, not a lender. Lenders decide approval, rates and terms.</p>
    </div>
    <div id="who-its-for" className={styles.heroQuestion}>
      <p className={styles.questionMeta}>Start here · Step 1 of 4</p>
      <h2>What do you need the money for?</h2>
      <HeroGoals />
      <p className={styles.questionNote}>No account. No credit check here. Nothing is sent until you review it.</p>
      <p className={styles.contactNote}>At review, choose email or WhatsApp to receive your result link.</p>
    </div>
  </div></section>;
}
