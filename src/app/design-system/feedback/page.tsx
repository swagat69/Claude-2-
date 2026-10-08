import type { Metadata } from "next";
import { Button } from "@/components/button/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { Faq, type FaqItem } from "@/components/faq/Faq";
import { InfoTip } from "@/components/help/InfoTip";
import { StatusCard } from "@/components/status/StatusCard";
import { Section, Sub } from "../_doc/Section";
import { Decisions, DocHero, Example, Spec, State, States, type Decision } from "../_doc/Specimen";
import { Toc } from "../_doc/Toc";
import ds from "../ds.module.css";
import specimen from "../_doc/specimen.module.css";
import { DialogDemo, DismissibleNoticeDemo, ToastDemo } from "./demos";

export const metadata: Metadata = {
  title: "Feedback components · Design system",
  description: "DFX feedback and overlay components: notices, toasts, dialogs, status cards, help tips, FAQ and empty states.",
};

const sections = [
  { id: "notices", title: "Notices" },
  { id: "toasts", title: "Toasts" },
  { id: "dialogs", title: "Dialog and sheet" },
  { id: "status", title: "Status card" },
  { id: "help", title: "Help tip" },
  { id: "faq", title: "FAQ accordion" },
  { id: "empty", title: "Empty and error views" },
  { id: "decisions", title: "Decisions" },
];

const faqItems: FaqItem[] = [
  {
    question: "What will I be asked?",
    answer: (
      <p>
        What you need help with, a little about your situation, such as your employment, and what matters most to
        you. Each question says why we ask it.
      </p>
    ),
  },
  {
    question: "How long does it take?",
    answer: <p>A few short questions. You can review and change every answer before you send it.</p>,
  },
  {
    question: "Who will contact me?",
    answer: (
      <p>
        Only the DFX team, and only through the channel you choose: email or WhatsApp. You decide whether to book
        a call.
      </p>
    ),
  },
  {
    question: "Is the result guaranteed?",
    answer: (
      <>
        <p>No. Your result shows routes that may fit, based on your answers.</p>
        <p>Lenders make the final decision and may run their own checks.</p>
      </>
    ),
  },
];

const decisions: Decision[] = [
  {
    question: "Toasts never carry errors",
    proposal:
      "A toast disappears, so it only confirms things that already worked (“Answers saved”). Anything someone must act on is an inline notice that stays until they do.",
  },
  {
    question: "Toast timing",
    proposal: "Six seconds, paused while hovered or focused, at most three at once, always with a close button.",
  },
  {
    question: "Bottom sheet on phones",
    proposal:
      "Dialogs rise from the bottom on phones, within thumb reach, and centre on larger screens. Tapping the backdrop closes them unless that would lose work. A destructive confirmation opens with focus on the safe choice.",
  },
  {
    question: "Honest waiting",
    proposal:
      "The processing state lists real backend steps with a static marker: no spinner, no percentage, no fake delay. When the wait could be long, it says you can leave.",
  },
  {
    question: "“No match” is warm, not red",
    proposal:
      "No match uses peach, distinct from the orange of a system problem and the red of a form error. Not being suitable is not a failure.",
  },
  {
    question: "Help tips open on tap",
    proposal:
      "Help tips open on click or tap, never hover only, so they work by touch, mouse and keyboard. Longer reasons use the “Why we ask” disclosure from the form components.",
  },
];

export default function FeedbackPage() {
  return (
    <main id="main">
      <DocHero
        id="feedback-title"
        eyebrow="Part 2b · Feedback and overlays"
        title="Say what’s happening, honestly and calmly."
        lead="How the product talks back: confirmations, problems, waiting, results that need a person, and the moments when there’s nothing to show."
        meta={["Brief §9, §10, §13 · families 08–10, 14, 15, 20", "In review", "Axe and keyboard tested"]}
      />

      <div className={`container ${ds.layout}`}>
        <Toc items={sections} />

        <div className={ds.content}>
          <Section
            id="notices"
            index={1}
            title="Notices"
            intro="Inline messages that sit where the problem or news is. Tone is shown by icon, heading and colour together."
          >
            <States wide>
              <State label="Info">
                <Notice tone="info" title="Before you start">
                  It takes a few short questions, and you can review every answer before you send it.
                </Notice>
              </State>
              <State label="Success">
                <Notice tone="success" title="Email confirmed">
                  We’ll send your result to meiling@example.com.
                </Notice>
              </State>
              <State label="Warning">
                <Notice tone="warning" title="WhatsApp didn’t open">
                  Your assessment is still saved here. Try again, or get a link by email instead.
                </Notice>
              </State>
              <State label="Error, with actions">
                <Notice
                  tone="error"
                  title="We couldn’t save your answers"
                  actions={
                    <>
                      <Button size="compact">Try again</Button>
                      <Button size="compact" variant="tertiary">
                        Get help
                      </Button>
                    </>
                  }
                >
                  Check your connection. Nothing you’ve entered on this page has been lost.
                </Notice>
              </State>
            </States>
            <Example title="Try it: dismissible notice">
              <DismissibleNoticeDemo />
            </Example>
            <Spec
              test="A critical error stays until the person can act. Only informational notices can be dismissed."
              a11y="Icon has a text label (Information, Warning…). Live only when it appears after an action: polite for status, assertive for blocking errors."
              figma="Notice / tone=error / actions=true / dismissible=false"
            />
          </Section>

          <Section
            id="toasts"
            index={2}
            title="Toasts"
            intro="A brief confirmation that something worked. Never used for errors."
          >
            <Example title="Try it: toasts appear at the bottom of the screen">
              <ToastDemo />
            </Example>
            <Spec
              test="Six seconds, paused on hover or focus; dismissible; never an error."
              a11y="An always-present polite live region announces each toast. The close button is reachable by keyboard."
              figma="Toast / tone=success"
            />
          </Section>

          <Section
            id="dialogs"
            index={3}
            title="Dialog and sheet"
            intro="For confirmations and longer disclosures. A centred dialog on larger screens, a bottom sheet on phones."
          >
            <Example title="Try it: Escape, the close button or the backdrop all close it">
              <DialogDemo />
            </Example>
            <Spec
              test="Focus is trapped inside, Escape closes, and focus returns to the button that opened it."
              a11y="Native <dialog> opened with showModal(): the page behind is inert. Title and description are linked; scrolling behind is locked."
              figma="Dialog / size=small / layout=sheet / footer=2"
            />
          </Section>

          <Section
            id="status"
            index={4}
            title="Status card"
            intro="The real state of an assessment, from the backend. Five states, each with its own look and words."
          >
            <div className={specimen.stack}>
              <StatusCard
                status="processing"
                title="We’re checking the information you shared."
                steps={[
                  { label: "Answers received", state: "done" },
                  { label: "Checking which routes fit", state: "current" },
                  { label: "Preparing your result", state: "pending" },
                ]}
                actions={<Button variant="tertiary">Leave and come back later</Button>}
              >
                <p>You can leave this page. We’ll let you know when your result is ready, through the channel you chose.</p>
              </StatusCard>
              <StatusCard
                status="fit"
                title="Here are the options worth exploring."
                actions={
                  <>
                    <Button iconEnd="arrow-right">See my options</Button>
                    <Button variant="tertiary">Review my answers</Button>
                  </>
                }
              >
                <p>Based on your answers, two routes may fit. Nothing is approved yet: lenders make the final decision.</p>
              </StatusCard>
              <StatusCard
                status="review"
                title="We need one more detail to recommend the best next step."
                actions={
                  <>
                    <Button iconEnd="arrow-right">Talk it through with our team</Button>
                    <Button variant="tertiary">Continue later</Button>
                  </>
                }
              >
                <p>Your answers don’t tell us enough about your current repayments. A short call usually sorts this out.</p>
              </StatusCard>
              <StatusCard
                status="no-match"
                title="We don’t have a suitable option right now."
                actions={
                  <>
                    <Button variant="secondary">Check my answers</Button>
                    <Button variant="tertiary">See other ways we can help</Button>
                  </>
                }
              >
                <p>
                  None of the routes we work with fit your answers at the moment. If something was entered wrongly, you
                  can change it.
                </p>
              </StatusCard>
              <StatusCard
                status="unavailable"
                title="We couldn’t load your result just now."
                actions={
                  <>
                    <Button iconStart="refresh">Try again</Button>
                    <Button variant="tertiary">Get help</Button>
                  </>
                }
              >
                <p>Your answers are saved. This is a problem on our side, not with your answers.</p>
              </StatusCard>
            </div>
            <Spec
              test="Truthful copy and icon for each state; no improvised score; a service error is never shown as “no match”."
              a11y="Each card is a labelled section; steps say done, in progress or not started. The page moves focus to the title when the status changes."
              figma="Status / state=no-match / actions=2"
            />
          </Section>

          <Section
            id="help"
            index={5}
            title="Help tip"
            intro="A short explanation beside a label, opened with a tap or click."
          >
            <States wide>
              <State label="Next to a field label">
                <p className={specimen.labelRow}>
                  <strong>Monthly income</strong>
                  <InfoTip label="Why we ask about monthly income">
                    Lenders use income to work out what repayments are affordable. A range is enough.
                  </InfoTip>
                </p>
              </State>
              <State label="Next to a question">
                <p className={specimen.labelRow}>
                  <strong>Why do you need my mobile number?</strong>
                  <InfoTip label="About your mobile number">
                    Only to send updates about this request on WhatsApp, if you choose it. Never for marketing
                    unless you say yes.
                  </InfoTip>
                </p>
              </State>
            </States>
            <Spec
              test="Opens with touch, mouse and keyboard; Escape or a tap elsewhere closes it."
              a11y="A button with a descriptive hidden label, aria-expanded, and a live region that receives the text when opened."
              figma="Tip / state=open / placement=below"
            />
          </Section>

          <Section
            id="faq"
            index={6}
            title="FAQ accordion"
            intro="The four questions people worry about before they start (brief H0.7). Nothing opens by itself."
          >
            <Sub title="One open at a time" />
            <Faq items={faqItems} exclusive />
            <p className={`type-meta ${ds.muted} ${ds.note}`}>Answers are placeholders until the product team approves the copy.</p>
            <Spec
              test="Native disclosure; works by keyboard; single or multiple open."
              a11y="<details>/<summary>: no custom ARIA to get wrong, and answers show up in find-in-page."
              figma="FAQ / mode=single / item=open"
            />
          </Section>

          <Section
            id="empty"
            index={7}
            title="Empty and error views"
            intro="When a whole view can’t show what was expected. Each gives the real reason and one clear next step."
          >
            <States wide>
              <State label="Expired link">
                <EmptyState
                  icon="clock"
                  title="This link has expired"
                  actions={
                    <>
                      <Button size="compact">Send me a new link</Button>
                      <Button size="compact" variant="tertiary">
                        Start again
                      </Button>
                    </>
                  }
                >
                  <p>For your security, links to your result only work for a limited time. Your answers are still saved.</p>
                </EmptyState>
              </State>
              <State label="No connection">
                <EmptyState icon="globe" title="You’re offline" actions={<Button size="compact" iconStart="refresh">Try again</Button>}>
                  <p>Check your connection, then try again. Nothing you’ve entered on this page has been lost.</p>
                </EmptyState>
              </State>
              <State label="Session lost">
                <EmptyState
                  icon="lock"
                  title="We couldn’t find your saved answers"
                  actions={
                    <>
                      <Button size="compact">Start again</Button>
                      <Button size="compact" variant="tertiary">
                        Find my link
                      </Button>
                    </>
                  }
                >
                  <p>
                    This can happen after clearing your browser or switching device. Open the link we sent you, or start
                    again.
                  </p>
                </EmptyState>
              </State>
              <State label="Page not found">
                <EmptyState icon="route" title="We can’t find that page" actions={<Button size="compact">Go to the homepage</Button>}>
                  <p>The link may be old or mistyped.</p>
                </EmptyState>
              </State>
            </States>
            <Spec
              test="A clear next action and the real reason; never a dead end or an endless spinner."
              a11y="Heading level set per page; the icon is decorative."
              figma="Empty / reason=expired-link / actions=2"
            />
          </Section>

          <Section
            id="decisions"
            index={8}
            title="Decisions"
            intro="Calls made in this batch, following the brief and the rules approved in 2a."
          >
            <Decisions items={decisions} />
          </Section>
        </div>
      </div>
    </main>
  );
}
