import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { business } from "@/config/business";
import { media } from "@/config/media";
import { startHref } from "@/config/site";
import styles from "./home.module.css";

export function LenderLogos() {
  if (media.lenderLogos.length < 3) return null;
  return <section className={`container ${styles.lenders}`} aria-label="Participating lenders"><p>Banks and financial institutions we work with</p>
    <ul>{media.lenderLogos.map(logo => <li key={logo.name}><Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} /></li>)}</ul>
  </section>;
}

const steps = [
  { title: "Tell us what you need", text: "Choose a purpose, share a little about your situation, then tell us your preferences." },
  { title: "Review, then receive your result", text: "Check your answers and choose a contact channel. Your result explains possible loan routes and what needs lender confirmation." },
  { title: "Decide whether a conversation helps", text: "If you want a call, choose a time. You can also keep your result without booking." },
];

export function HowItWorks() {
  return <section id="how-it-works" className={styles.section} aria-labelledby="how-title"><div className={`container ${styles.processGrid}`}>
    <div><h2 id="how-title" className={styles.sectionTitle}>What happens after you answer</h2>
      <ol className={styles.steps}>{steps.map((step, index) => <li key={step.title}><span className={styles.stepNum}>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
    </div>
    <figure className={styles.reviewNote}>
      <Image src="/images/review-screen.png" alt="The review screen groups your goals and situation, with a Change link beside each group." width={720} height={554} sizes="(max-width: 767px) calc(100vw - 32px), 440px" />
      <figcaption>The actual review screen, with example answers. You can change each group before continuing.</figcaption>
    </figure>
  </div></section>;
}

const questions = [
  { question: "What will I be asked?", answer: "Your loan purpose, a little about your situation, and what matters to you. You can use ranges, and optional questions are marked." },
  { question: "What does DFX cost?", answer: "The DFX matching service is free for you. A lender may pay DFX a referral fee. The lender’s own interest and charges depend on its offer." },
  { question: "Who receives my information?", answer: "DFX and the service providers described in the privacy notice. Your details are not passed to a lender unless you agree to an introduction to that lender." },
  { question: "How long does it take?", answer: "There are four steps: goals, situation, preferences and review. You can go back at any point. Your unsent answers stay in this tab for one hour after your last change." },
];

export function Expectations() {
  return <section id="faqs" className={styles.section} aria-labelledby="faq-title"><div className="container"><h2 id="faq-title" className={styles.sectionTitle}>Questions people ask first</h2>
    <dl className={styles.faqList}>{questions.map(item => <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}</dl>
  </div></section>;
}

export function Support() {
  return <section className={`${styles.section} ${styles.people}`} aria-labelledby="support-title"><div className={`container ${styles.supportGrid}`}>
    <div><h2 id="support-title" className={styles.sectionTitle}>A conversation, when you want one</h2><p className={styles.supportLead}>Talk through the differences between routes, ask questions, and decide on a next step at your own pace.</p><Link href="/contact" className={styles.textLink}>Contact and support information <Icon name="arrow-right" size={20} /></Link></div>
    <dl className={styles.supportFacts}>
      <div><dt><Icon name="clock" size={20} /> Hours</dt><dd>{business.support.hours}</dd></div>
      <div><dt><Icon name="phone" size={20} /> About the call</dt><dd>{business.call.minutes} minutes, by phone or video on {business.call.videoTool}</dd></div>
      <div><dt><Icon name="message" size={20} /> Replies</dt><dd>{business.support.replyTime.charAt(0).toUpperCase() + business.support.replyTime.slice(1)}</dd></div>
    </dl>
  </div></section>;
}

export function FinalCta() {
  return <section className={styles.closing} aria-labelledby="final-title"><div className={`container ${styles.closingInner}`}><h2 id="final-title">Start with what you need. You can stop at any point</h2><ButtonLink href={startHref("final")} iconEnd="arrow-right">Start assessment</ButtonLink></div></section>;
}
