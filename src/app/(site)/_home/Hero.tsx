import { ButtonLink } from "@/components/button/Button";
import { AmbientOrb } from "@/components/decor/AmbientOrb";
import { Icon } from "@/components/icon/Icon";
import { DisplayText } from "@/components/type/DisplayText";
import { startHref } from "@/config/site";
import { CallPreview, QuestionPreview, ResultPreview } from "./previews";
import styles from "./home.module.css";

/**
 * H0.2 hero. Text on 5 columns, art on 7 from 1024px; below that the art
 * collapses to one core preview card after the CTA. The headline and copy
 * render at full opacity without JavaScript; only CSS entrance motion plays.
 */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGlow} aria-hidden="true">
        <AmbientOrb color="blush" size={520} className={styles.orbBlush} />
        <AmbientOrb color="green" size={460} depth={-0.7} className={styles.orbGreen} />
        <AmbientOrb color="amber" size={340} depth={0.5} className={styles.orbAmber} />
      </div>

      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={`type-eyebrow ${styles.eyebrow}`}>Loan matching in Singapore</p>
          <h1 id="hero-title" className={`type-display-xl ${styles.heroTitle}`}>
            <DisplayText>Make the right next move, with clarity.</DisplayText>
          </h1>
          <p className={`type-body-l ${styles.heroLead}`}>
            Answer a few questions about the loan you need, see which routes may fit, and talk to our team only if it
            helps.
          </p>
          <div className={styles.heroCtas}>
            <ButtonLink href={startHref("hero")} iconEnd="arrow-right" className={styles.heroCta}>
              Find my next step
            </ButtonLink>
            <a href="#how-it-works" className={styles.textLink}>
              See how it works
            </a>
          </div>
          <ul className={styles.assurances}>
            <li>
              <Icon name="check" size={20} />
              No account needed
            </li>
            <li>
              <Icon name="check" size={20} />
              Review every answer before you send it
            </li>
          </ul>
        </div>

        <figure className={styles.heroArt}>
          <div className={styles.heroCards} aria-hidden="true" inert>
            <div className={styles.cardQuestion}>
              <QuestionPreview />
            </div>
            <div className={styles.cardResult}>
              <ResultPreview />
            </div>
            <div className={styles.cardCall}>
              <CallPreview />
            </div>
          </div>
          <figcaption className={styles.previewLabel}>Illustrative preview</figcaption>
        </figure>
      </div>
    </section>
  );
}
