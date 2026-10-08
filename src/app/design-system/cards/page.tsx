import type { Metadata } from "next";
import { AdvisorPanel } from "@/components/advisor/AdvisorPanel";
import { Button, ButtonLink } from "@/components/button/Button";
import { CategoryTile } from "@/components/category/CategoryTile";
import { AmbientOrb } from "@/components/decor/AmbientOrb";
import { BackLink, SiteHeader } from "@/components/nav/SiteHeader";
import { RouteCard } from "@/components/result/RouteCard";
import { StatusCard } from "@/components/status/StatusCard";
import { Section, Sub } from "../_doc/Section";
import { Decisions, DocHero, Example, Frame, Spec, State, States, type Decision } from "../_doc/Specimen";
import { Toc } from "../_doc/Toc";
import ds from "../ds.module.css";
import { BookingDemo } from "./demos";
import styles from "./cards.module.css";

export const metadata: Metadata = {
  title: "Cards and booking · Design system",
  description: "DFX result cards, advisor panel, booking slots, category tiles, ambient orbs and navigation.",
};

const sections = [
  { id: "result", title: "Result card" },
  { id: "advisor", title: "Advisor panel" },
  { id: "booking", title: "Booking slots" },
  { id: "tiles", title: "Category tiles" },
  { id: "orb", title: "Ambient orb" },
  { id: "navigation", title: "Navigation" },
  { id: "assembled", title: "Assembled: result R1" },
  { id: "decisions", title: "Decisions" },
];

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#who-its-for", label: "Who it’s for" },
  { href: "#faqs", label: "FAQs" },
];
const navCta = { href: "/design-system/forms#assembled", label: "Start assessment", shortLabel: "Start" };

function PersonalLoanCard() {
  return (
    <RouteCard
      title="Personal instalment loan"
      reasons={["You’d like one fixed monthly repayment", "Lenders we work with accept your type of employment"]}
      facts={[
        { label: "Typical tenure", value: "1–5 years" },
        { label: "Lender decision", value: "Usually 1–3 working days" },
        { label: "Interest rate", value: "Set by the lender after review" },
      ]}
      factsAsOf="Example values for design only · Real figures come from the results engine, dated"
      action={
        <ButtonLink href="#booking" iconEnd="arrow-right">
          Discuss this option
        </ButtonLink>
      }
      details={
        <>
          <p>A fixed amount repaid in equal monthly instalments. The lender sets the rate after looking at your application.</p>
          <p>Placeholder: approved explanation of fees and early-repayment terms.</p>
        </>
      }
      smallPrint="The lender decides on approval and rates. Applying may involve a credit check by the lender."
    />
  );
}

function ConsolidationCard() {
  return (
    <RouteCard
      title="Debt consolidation plan"
      reasons={["You have several unsecured debts to bring together", "One repayment date could be easier to manage"]}
      action={
        <ButtonLink href="#booking" variant="secondary" iconEnd="arrow-right">
          Discuss this option
        </ButtonLink>
      }
      smallPrint="Eligibility depends on the lender’s criteria and your total unsecured debt."
    />
  );
}

function CallPanel() {
  return (
    <AdvisorPanel
      who="A DFX loan specialist"
      title="Want to walk through your options?"
      body="In a short call, we’ll review your needs and answer your questions."
      duration="About 15 minutes"
      format="Phone or video call"
      agenda={["Check what you need", "Walk through the routes that may fit", "Agree next steps, if any"]}
      action={
        <ButtonLink href="#booking" variant="accent" iconEnd="arrow-right">
          Choose a time
        </ButtonLink>
      }
      decline={<Button variant="tertiary">No thanks, keep my results</Button>}
    />
  );
}

const decisions: Decision[] = [
  {
    question: "No ranking without a basis",
    proposal:
      "Result cards say “Suggested route”, never “Top pick” or a match percentage. Facts appear only when verified, with the date they were true. Placeholder figures are labelled as such.",
  },
  {
    question: "The call comes second",
    proposal:
      "On wide screens the result takes eight columns and the call invitation four. On phones the call panel follows the explanation. Saying no keeps the results on screen.",
  },
  {
    question: "Lime button on forest only",
    proposal:
      "The advisor panel is the one place the lime accent button appears, on its forest surface, so the invitation stands out without competing with the result.",
  },
  {
    question: "Times are always labelled",
    proposal:
      "Booking shows Singapore time with its UTC offset, offers the device’s own zone when it differs, and keeps full or taken slots visible but disabled. Choosing a slot is not booking it.",
  },
  {
    question: "Header on phones scrolls away",
    proposal:
      "From 768px the header sticks and compresses from 78px to 64px. On phones it is a plain 64px row that scrolls away (brief: no large sticky nav), and the menu opens as a bottom sheet.",
  },
  {
    question: "Orbs are decoration only",
    proposal:
      "Hidden from screen readers, never block clicks, drift at most 16px and only with a mouse and motion allowed. They disappear entirely when reduced transparency is requested.",
  },
];

export default function CardsPage() {
  return (
    <main id="main">
      <DocHero
        id="cards-title"
        eyebrow="Part 2c · Cards, booking and navigation"
        title="Results first, then an honest invitation."
        lead="The pieces of the results screen, the call booking, the homepage’s category tiles and atmosphere, and the global navigation."
        meta={["Brief §6, §10, §13 · families 11–13, 16–18", "In review", "Axe and keyboard tested"]}
      />

      <div className={`container ${ds.layout}`}>
        <Toc items={sections} />

        <div className={ds.content}>
          <Section
            id="result"
            index={1}
            title="Result card"
            intro="One route that may fit: why, what’s verified about it, and the specific next step."
          >
            <div className={styles.cardStack}>
              <PersonalLoanCard />
              <ConsolidationCard />
            </div>
            <Spec
              test="Accessible headings and link purpose; no invented price, rate, score or ranking."
              a11y="Each card is an article with a heading; facts are a description list; the details fold is native."
              figma="Result / facts=true / details=true / smallprint=true"
            />
          </Section>

          <Section
            id="advisor"
            index={2}
            title="Advisor panel"
            intro="Why a call is worth it, who you’ll talk to, how long it takes, and an easy way to say no."
          >
            <div className={styles.narrowCol}>
              <CallPanel />
            </div>
            <Spec
              test="Explains the commitment before booking; declining doesn’t remove the result."
              a11y="A labelled complementary region. Text and focus colours on forest are checked in the contrast audit."
              figma="Advisor / role=specialist / actions=2"
            />
          </Section>

          <Section
            id="booking"
            index={3}
            title="Booking slots"
            intro="Pick a day, then a time. The time zone is always shown, and nothing is booked until it’s confirmed."
          >
            <Example title="Try it: press Confirm without choosing, then choose a time">
              <BookingDemo />
            </Example>
            <Spec
              test="No preselected or unavailable time; time zone always visible; a held slot is never shown as booked."
              a11y="Two radio groups (day, time). Unavailable times are disabled and say so in text, not just by strikethrough."
              figma="Slot / state=selected · Slot / state=unavailable"
            />
          </Section>

          <Section
            id="tiles"
            index={4}
            title="Category tiles"
            intro="Who DFX is for, as ticket tiles from image 4. The whole tile is the target; the title is the link."
          >
            <div className={styles.tiles}>
              <CategoryTile theme="green" icon="wallet" title="Personal loan" text="For everyday costs, travel or a big purchase." href="#tiles" />
              <CategoryTile theme="orange" icon="layers" title="Debt consolidation" text="Bring several debts into one monthly repayment." href="#tiles" />
              <CategoryTile theme="lime" icon="home" title="Home renovation" text="For works on a home you own or rent." href="#tiles" />
              <CategoryTile theme="blue" icon="briefcase" title="Business loan" text="Working capital or equipment for your business." href="#tiles" />
              <CategoryTile theme="sage" icon="help" title="Not sure yet" text="Answer a few questions and we’ll suggest where to start." href="#tiles" />
              <CategoryTile theme="forest" icon="route" title="Compare routes" text="See how the main loan types differ before you start." href="#tiles" />
            </div>
            <Spec
              test="Text contrast checked on every fill; focus ring visible outside the ticket cut; no hover-only content."
              a11y="One link per tile (its title) with a stretched hit area; the icon and “Explore” label are decorative."
              figma="Tile / theme=orange / state=focus"
            />
          </Section>

          <Section
            id="orb"
            index={5}
            title="Ambient orb"
            intro="Soft, blurred colour behind hero art. Move your pointer over the page to see the drift."
          >
            <div className={styles.orbStage}>
              <AmbientOrb color="blush" size={420} className={styles.orbBlush} />
              <AmbientOrb color="green" size={380} depth={-0.8} className={styles.orbGreen} />
              <AmbientOrb color="amber" size={300} depth={0.6} className={styles.orbAmber} />
              <p className={styles.orbCaption}>Decorative only · aria-hidden · no pointer events</p>
            </div>
            <Spec
              test="Never behind body text, fields or results; static with reduced motion; gone with reduced transparency."
              a11y="Hidden from assistive technology and from pointer hit-testing."
              figma="Orb / color=blush / intensity=strong"
            />
          </Section>

          <Section
            id="navigation"
            index={6}
            title="Navigation"
            intro="The global header in its states, and the back link used inside the assessment."
          >
            <Sub title="Header" />
            <States single>
              <State label="Wide · top of page (78px, transparent)">
                <div className={styles.headerPreview}>
                  <SiteHeader links={navLinks} cta={navCta} sticky={false} compact={false} />
                </div>
              </State>
              <State label="Wide · after scrolling (64px, keyline)">
                <div className={styles.headerPreview}>
                  <SiteHeader links={navLinks} cta={navCta} sticky={false} compact />
                </div>
              </State>
              <State label="Phone width · menu opens a sheet">
                <div className={`${styles.headerPreview} ${styles.phoneWidth}`}>
                  <SiteHeader links={navLinks} cta={navCta} sticky={false} compact />
                </div>
              </State>
              <State label="Back link">
                <BackLink href="#navigation" />
              </State>
            </States>
            <Spec
              test="Consistent landmarks; nothing sticky hides the focused control; no focus loss when the menu closes."
              a11y="Header links and menu sheet share one list; the menu button reports its state; Back is a real link."
              figma="Header / width=wide / state=compact · Header / width=phone / menu=open"
            />
          </Section>

          <Section
            id="assembled"
            index={7}
            title="Assembled: result R1"
            intro="The result first, then the call invitation: 8 and 4 columns on wide screens, stacked on phones."
          >
            <Frame>
              <div className={styles.results}>
                <div className={styles.resultsMain}>
                  <StatusCard status="fit" title="Here are the options worth exploring.">
                    <p>Based on your answers, two routes may fit. Nothing is approved yet: lenders make the final decision.</p>
                  </StatusCard>
                  <PersonalLoanCard />
                  <ConsolidationCard />
                </div>
                <div className={styles.resultsAside}>
                  <CallPanel />
                </div>
              </div>
            </Frame>
          </Section>

          <Section
            id="decisions"
            index={8}
            title="Decisions"
            intro="Calls made in this batch, following the brief and the rules approved so far."
          >
            <Decisions items={decisions} />
          </Section>
        </div>
      </div>
    </main>
  );
}
