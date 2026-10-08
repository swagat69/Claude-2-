import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/button/Button";
import { CategoryTile, type TileTheme } from "@/components/category/CategoryTile";
import { AmbientOrb } from "@/components/decor/AmbientOrb";
import { Faq, type FaqItem } from "@/components/faq/Faq";
import { Icon, type IconName } from "@/components/icon/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { DisplayText } from "@/components/type/DisplayText";
import { startHref } from "@/config/site";
import styles from "./home.module.css";

function SectionHead({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <Reveal className={styles.sectionHead} amount={0.25}>
      <p className={`type-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      <h2 id={id} className="type-display-l">
        <DisplayText>{title}</DisplayText>
      </h2>
      {children ? <p className={`type-body-l ${styles.sectionIntro}`}>{children}</p> : null}
    </Reveal>
  );
}

/* H0.3 ---------------------------------------------------------------------- */

const proofPoints: { icon: IconName; title: string; text: string }[] = [
  { icon: "document", title: "A few short questions", text: "Review every answer before you send it." },
  { icon: "message", title: "You choose how we contact you", text: "Email or WhatsApp. No marketing unless you say yes." },
  { icon: "phone", title: "A call only if it helps", text: "Your result comes first. Booking is up to you." },
];

/** Proof points are true by design of the product; logos and testimonials wait for permission (brief H0.3). */
export function TrustStrip() {
  return (
    <section className={styles.trust} aria-label="What you can expect from DFX">
      <ul className={`container ${styles.trustList}`}>
        {proofPoints.map((point, i) => (
          <Reveal as="li" key={point.title} index={i} amount={0.15} className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">
              <Icon name={point.icon} />
            </span>
            <span>
              <strong>{point.title}</strong>
              <span className={styles.trustText}>{point.text}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* H0.4 ---------------------------------------------------------------------- */

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "document",
    title: "Tell us about your goal",
    text: "A few short questions about what you need and your situation. Each one says why we ask.",
  },
  {
    icon: "route",
    title: "See a considered recommendation",
    text: "The loan routes that may fit, and why. Nothing is approved until a lender decides.",
  },
  {
    icon: "phone",
    title: "Choose whether to speak to us",
    text: "If a call would help, book a time that suits you. If not, your result is yours to keep.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className={`${styles.section} ${styles.band}`} aria-labelledby="how-title">
      <div className="container">
        <SectionHead id="how-title" eyebrow="How it works" title="Three steps. You stay in control.">
          No account to create, and nothing is sent until you’ve checked it.
        </SectionHead>
        <Reveal as="ol" className={styles.steps} amount={0.25} variant="fade">
          {steps.map((step, i) => (
            <li key={step.title} className={styles.step} style={{ "--i": i } as CSSProperties}>
              <span className={styles.stepNum}>
                <span className="visually-hidden">Step </span>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.stepBody}>
                <span className={styles.stepIcon} aria-hidden="true">
                  <Icon name={step.icon} />
                </span>
                <h3 className="type-h3">{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* H0.5 ---------------------------------------------------------------------- */

const tiles: { theme: TileTheme; icon: IconName; title: string; text: string; goal: string }[] = [
  { theme: "green", icon: "wallet", title: "Personal loan", text: "For everyday costs, travel or a big purchase.", goal: "personal" },
  { theme: "orange", icon: "layers", title: "Debt consolidation", text: "Bring several debts into one monthly repayment.", goal: "consolidation" },
  { theme: "lime", icon: "home", title: "Home renovation", text: "For works on a home you own or rent.", goal: "renovation" },
  { theme: "blue", icon: "briefcase", title: "Business loan", text: "Working capital or equipment for your business.", goal: "business" },
  { theme: "peach", icon: "document", title: "Education loan", text: "Course fees for you or someone in your family.", goal: "education" },
  { theme: "sage", icon: "help", title: "Not sure yet", text: "Answer a few questions and we’ll suggest where to start.", goal: "not-sure" },
];

export function WhoItsFor() {
  return (
    <section id="who-its-for" className={styles.section} aria-labelledby="who-title">
      <div className="container">
        <SectionHead id="who-title" eyebrow="Who it’s for" title="Start from what you need.">
          Pick the closest match, or start with “Not sure yet”. You can change it in the first question.{" "}
          <Placeholder note="The loan categories DFX actually supports, confirmed by the product team" />
        </SectionHead>
        <div className={styles.tiles}>
          {tiles.map((tile, i) => (
            <Reveal key={tile.goal} index={i % 3} amount={0.2} className={styles.tileCell}>
              <CategoryTile
                theme={tile.theme}
                icon={tile.icon}
                title={tile.title}
                text={tile.text}
                href={startHref("tile", tile.goal)}
                linkLabel="Start here"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* H0.7 ---------------------------------------------------------------------- */

const faqItems: FaqItem[] = [
  {
    question: "What will I be asked?",
    answer: (
      <p>
        What you need the loan for, a little about your situation, such as your employment, and what matters most to
        you. Each question says why we ask it.
      </p>
    ),
  },
  {
    question: "How long does it take?",
    answer: <p>A few short questions. You can go back, change anything, and review every answer before you send it.</p>,
  },
  {
    question: "Who will contact me?",
    answer: (
      <>
        <p>Only the DFX team, and only through the channel you choose: email or WhatsApp.</p>
        <p>
          <Placeholder note="Who contacts users, when, and whether and when details are shared with lenders">
            Whether and when your details go to a lender is explained before anything is shared.
          </Placeholder>
        </p>
      </>
    ),
  },
  {
    question: "Is the result guaranteed?",
    answer: (
      <p>
        No. Your result shows routes that may fit, based on your answers. Lenders make the final decision and may run
        their own checks.
      </p>
    ),
  },
];

export function Expectations() {
  return (
    <section id="faqs" className={`${styles.section} ${styles.band}`} aria-labelledby="faq-title">
      <div className={`container ${styles.split}`}>
        <SectionHead id="faq-title" eyebrow="What to expect" title="Before you start">
          The four things people ask most before they begin.
        </SectionHead>
        {/* Questions are readable straight away; only the heading fades in (brief §15, scene 5). */}
        <Faq items={faqItems} />
      </div>
    </section>
  );
}

/* H0.8 ---------------------------------------------------------------------- */

export function Support() {
  return (
    <section className={styles.section} aria-labelledby="support-title">
      <div className={`container ${styles.supportGrid}`}>
        <div className={styles.supportArt} aria-hidden="true">
          <span className={styles.shapeMessage}>
            <span />
            <span />
            <span />
          </span>
          <span className={styles.shapeTicket}>
            <Icon name="phone" size={32} />
          </span>
          <span className={styles.shapeCircle} />
          <span className={styles.shapeTile}>
            <Icon name="message" size={32} />
          </span>
          <Reveal className={styles.annotation} variant="fade" index={3} amount={0.5}>
            <Icon name="clock" size={20} />
            <Placeholder note="Committed reply time">Replies within one working day</Placeholder>
          </Reveal>
        </div>
        <div>
          <SectionHead id="support-title" eyebrow="Real support" title="Talk to a person when you want to.">
            Our team can walk you through your result by phone or video, or answer questions on WhatsApp or email.
          </SectionHead>
          <ul className={styles.supportList}>
            <li>
              <Icon name="clock" />
              <span>
                Monday to Friday, 9 am to 6 pm Singapore time <Placeholder note="Confirmed service hours" />
              </span>
            </li>
            <li>
              <Icon name="message" />
              <span>
                WhatsApp and email <Placeholder note="Confirmed support channels and the WhatsApp business account" />
              </span>
            </li>
            <li>
              <Icon name="user" />
              <span>
                Loan specialists based in Singapore <Placeholder note="Team location, roles and, when ready, real team photos" />
              </span>
            </li>
          </ul>
          <ButtonLink href="/contact" variant="secondary" iconEnd="arrow-right">
            Contact the team
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* H0.9 ---------------------------------------------------------------------- */

export function FinalCta() {
  return (
    <section className={`${styles.section} ${styles.finalSection}`} aria-labelledby="final-title">
      <div className="container">
        <Reveal className={styles.finalPanel} variant="fade" amount={0.3}>
          <div className={styles.finalBloom} aria-hidden="true">
            <AmbientOrb color="lime" size={420} depth={0} className={styles.finalOrbLime} />
            <AmbientOrb color="green" size={380} depth={0} className={styles.finalOrbGreen} />
          </div>
          <div className={styles.finalContent} data-surface="inverse">
            <h2 id="final-title" className={`type-display-l ${styles.finalTitle}`}>
              <DisplayText>Ready when you are.</DisplayText>
            </h2>
            <p className={`type-body-l ${styles.finalText}`}>
              A few short questions, then a clear next step. What happens after that is up to you.
            </p>
            <div className={styles.heroCtas}>
              <ButtonLink href={startHref("final")} variant="accent" iconEnd="arrow-right" className={styles.heroCta}>
                Find my next step
              </ButtonLink>
              <a href="#how-it-works" className={`${styles.textLink} ${styles.textLinkInverse}`}>
                Read how it works
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
