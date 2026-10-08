import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Checkbox, ChoiceCards, Chips, Segmented, type ChoiceOption } from "@/components/form/Choices";
import { ConsentGroup } from "@/components/form/ConsentGroup";
import { Fieldset } from "@/components/form/Field";
import { Select, TextField } from "@/components/form/TextField";
import { Stepper } from "@/components/progress/Stepper";
import { QuestionHeading } from "@/components/question/QuestionHeading";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import { Section, Sub } from "../_doc/Section";
import { Toc } from "../_doc/Toc";
import ds from "../ds.module.css";
import { AssessmentStepDemo, BusyButtonDemo, StepperDemo, TextInputsDemo } from "./demos";
import styles from "./components.module.css";

export const metadata: Metadata = {
  title: "Form components · Design system",
  description: "DFX form components: buttons, inputs, choices, select, progress, question heading, review and consent.",
};

/* -------------------------------------------------------------------------- */
/* Doc helpers                                                                */
/* -------------------------------------------------------------------------- */

function States({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? `${styles.states} ${styles.statesWide}` : styles.states}>{children}</div>;
}

function State({ label, children, dark }: { label: string; children: ReactNode; dark?: boolean }) {
  return (
    <figure className={styles.state}>
      <div className={dark ? `${styles.stage} ${styles.stageDark}` : styles.stage}>{children}</div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.example}>
      <p className={`type-eyebrow ${styles.exampleTitle}`}>{title}</p>
      {children}
    </div>
  );
}

function Spec({ test, a11y, figma }: { test: ReactNode; a11y: ReactNode; figma: string }) {
  return (
    <dl className={styles.spec}>
      <div>
        <dt>Test rule</dt>
        <dd>{test}</dd>
      </div>
      <div>
        <dt>Accessibility</dt>
        <dd>{a11y}</dd>
      </div>
      <div>
        <dt>Figma</dt>
        <dd>
          <code>{figma}</code>
        </dd>
      </div>
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* Sample data                                                                */
/* -------------------------------------------------------------------------- */

const goalCards: ChoiceOption[] = [
  { value: "personal", label: "Personal loan", description: "For everyday costs, travel or a big purchase", icon: "wallet" },
  { value: "consolidation", label: "Debt consolidation", description: "Bring several debts into one repayment", icon: "layers" },
];

const priorities: ChoiceOption[] = [
  { value: "lower-monthly", label: "Lower monthly repayments" },
  { value: "pay-off-sooner", label: "Paying it off sooner" },
  { value: "fast-decision", label: "A quick decision" },
  { value: "flexible", label: "Flexible terms" },
  { value: "not-sure", label: "Not sure", notSure: true },
];

const industries = [
  "Banking and finance",
  "Construction",
  "Education",
  "Food and beverage",
  "Government",
  "Healthcare",
  "Hospitality",
  "IT and technology",
  "Logistics",
  "Manufacturing",
  "Retail",
  "Other",
].map((label) => ({ value: label.toLowerCase().replace(/\W+/g, "-"), label }));

const stages = ["Your goals", "Your situation", "Preferences", "Review"];

const sections = [
  { id: "buttons", title: "Buttons" },
  { id: "inputs", title: "Text inputs" },
  { id: "choices", title: "Choices" },
  { id: "select", title: "Select" },
  { id: "progress", title: "Progress" },
  { id: "question", title: "Question heading" },
  { id: "review", title: "Review summary" },
  { id: "consent", title: "Consent group" },
  { id: "assembled", title: "Assembled: step A1" },
  { id: "decisions", title: "Decisions" },
];

const decisions = [
  {
    question: "Error message above the field",
    proposal:
      "The brief’s component table says “error below field”, but its mobile rules say the keyboard must never hide an error. Below the field, the open keyboard covers it. I placed errors between label and field (the GOV.UK pattern the brief cites), plus a summary at the top after submit.",
  },
  {
    question: "When errors appear and clear",
    proposal:
      "Format errors appear when you leave a field; missing answers are flagged when you press Continue. Errors only clear, and the summary only changes, on the next Continue. Clearing them as you leave a field shifted the button just as people tapped it, so the tap was lost.",
  },
  {
    question: "“Not sure” sits apart",
    proposal: "Shown under an “or” divider, so it reads as a legitimate answer rather than one more option to compare.",
  },
  {
    question: "Busy, not disabled, while saving",
    proposal:
      "A busy button keeps focus and its label and ignores extra presses. Disabling it would drop keyboard focus mid-task.",
  },
  {
    question: "Native select",
    proposal:
      "Selects use the phone’s own picker. A searchable combobox only arrives if a list grows too long to scan (about 15+ options). For five or fewer options, use choice cards instead.",
  },
  {
    question: "Marketing consent per channel",
    proposal:
      "Email and WhatsApp marketing are separate, unticked boxes. In Singapore, marketing messages to phone numbers also fall under the PDPA Do Not Call rules, so they shouldn’t be bundled. Legal must approve the wording.",
  },
];

/* -------------------------------------------------------------------------- */

export default function ComponentsPage() {
  return (
    <main id="main">
      <section className={ds.hero} aria-labelledby="components-title">
        <div className={`container ${styles.heroInner}`}>
          <p className={`type-eyebrow ${ds.eyebrow}`}>Part 2a · Form components</p>
          <h1 id="components-title" className={`type-display-l ${styles.heroTitle}`}>
            Light to answer, and never lose an answer.
          </h1>
          <p className={`type-body-l ${ds.heroLead}`}>
            The controls the four-step assessment is built from. Every component uses the approved tokens and
            native HTML underneath, and shows each of its states below.
          </p>
          <ul className={ds.heroMeta} aria-label="Document status">
            <li>Brief §7, §13 · families 01–07 and 19</li>
            <li>In review</li>
            <li>Axe and keyboard tested</li>
          </ul>
        </div>
      </section>

      <div className={`container ${ds.layout}`}>
        <Toc items={sections} />

        <div className={ds.content}>
          {/* 01 Buttons ------------------------------------------------------ */}
          <Section
            id="buttons"
            index={1}
            title="Buttons"
            intro="One obvious primary action per screen. Every label names what happens next."
          >
            <Sub title="Variants" />
            <States wide>
              <State label="Primary">
                <Button iconEnd="arrow-right">Continue to your situation</Button>
              </State>
              <State label="Secondary">
                <Button variant="secondary">Review my answers</Button>
              </State>
              <State label="Tertiary">
                <Button variant="tertiary">Read how it works</Button>
              </State>
              <State label="Destructive">
                <Button variant="destructive">Delete my answers</Button>
              </State>
              <State label="Accent (forest surfaces only)" dark>
                <Button variant="accent" iconEnd="arrow-right">
                  Find my next step
                </Button>
              </State>
              <State label="Link styled as button">
                <ButtonLink href="#buttons" variant="secondary" iconEnd="arrow-right">
                  See how it works
                </ButtonLink>
              </State>
            </States>

            <Sub title="States" />
            <States>
              <State label="Default">
                <Button>Continue</Button>
              </State>
              <State label="Hover">
                <Button preview="hover">Continue</Button>
              </State>
              <State label="Pressed">
                <Button preview="pressed">Continue</Button>
              </State>
              <State label="Focus visible">
                <Button preview="focus-visible">Continue</Button>
              </State>
              <State label="Disabled">
                <Button disabled>Continue</Button>
              </State>
              <State label="Busy">
                <Button busy>Continue</Button>
              </State>
            </States>
            <States>
              <State label="Secondary · hover">
                <Button variant="secondary" preview="hover">
                  Back
                </Button>
              </State>
              <State label="Secondary · focus">
                <Button variant="secondary" preview="focus-visible">
                  Back
                </Button>
              </State>
              <State label="Tertiary · hover">
                <Button variant="tertiary" preview="hover">
                  Skip for now
                </Button>
              </State>
              <State label="Accent · focus" dark>
                <Button variant="accent" preview="focus-visible">
                  Find my next step
                </Button>
              </State>
            </States>

            <Sub title="Sizes and icons" />
            <States wide>
              <State label="Large · 52px">
                <Button>Choose a time</Button>
              </State>
              <State label="Compact · 44px">
                <Button size="compact">Choose a time</Button>
              </State>
              <State label="Icon at start">
                <Button variant="secondary" iconStart="arrow-left">
                  Back
                </Button>
              </State>
              <State label="Full width (narrow mobile)">
                <Button fullWidth iconEnd="arrow-right">
                  See my next step
                </Button>
              </State>
            </States>

            <Example title="Try it: tap fast, it only sends once">
              <BusyButtonDemo />
            </Example>
            <Spec
              test="Button text names the next action. Busy prevents duplicate requests."
              a11y="Native button. Busy uses aria-busy and aria-disabled so focus stays put. 52px tall; 2px focus ring."
              figma="Button / intent=primary / state=focus-visible / size=large / icon=end"
            />
          </Section>

          {/* 02 Text inputs -------------------------------------------------- */}
          <Section
            id="inputs"
            index={2}
            title="Text inputs"
            intro="Labels always visible. The right keyboard for each answer. Errors that say how to fix them."
          >
            <Sub title="States" />
            <States wide>
              <State label="Default">
                <TextField label="Full name" autoComplete="name" />
              </State>
              <State label="Hover">
                <TextField label="Full name" preview="hover" />
              </State>
              <State label="Focus">
                <TextField label="Full name" preview="focus" />
              </State>
              <State label="Filled">
                <TextField label="Full name" defaultValue="Tan Mei Ling" />
              </State>
              <State label="Error">
                <TextField label="Email address" defaultValue="meiling@" error="Enter your email in the format name@example.com" />
              </State>
              <State label="Verified">
                <TextField label="Email address" defaultValue="meiling@example.com" verified="Verified" readOnly />
              </State>
              <State label="Disabled">
                <TextField label="Full name" defaultValue="Tan Mei Ling" disabled />
              </State>
              <State label="Optional, with hint">
                <TextField label="Postal code" optional hint="6 digits" width="short" inputMode="numeric" autoComplete="postal-code" />
              </State>
            </States>

            <Sub title="Types">
              S$ amounts, +65 mobiles and emails each bring the right keyboard, autocomplete and tidy formatting
              on blur.
            </Sub>
            <States>
              <State label="Amount · S$ prefix, numeric keypad">
                <TextField label="Loan amount" prefix="S$" defaultValue="25,000" width="medium" inputMode="decimal" />
              </State>
              <State label="Mobile · +65, phone keypad">
                <TextField label="Mobile number" prefix="+65" defaultValue="9123 4567" width="medium" type="tel" />
              </State>
              <State label="Unit suffix">
                <TextField label="Preferred loan tenure" suffix="months" defaultValue="36" width="short" inputMode="numeric" />
              </State>
            </States>

            <Example title="Try it: errors on blur and on submit">
              <TextInputsDemo />
            </Example>
            <Spec
              test="Visible label, correct autocomplete and inputmode, error message attached to the field, and a summary after submit."
              a11y="Label, hint, error, prefix and suffix are all linked to the input with aria-describedby; aria-invalid on error. 16px text, so iOS doesn’t zoom."
              figma="Input / type=email / state=error / size=lg"
            />
          </Section>

          {/* 03 Choices ------------------------------------------------------ */}
          <Section
            id="choices"
            index={3}
            title="Choices"
            intro="The whole card is the target. Selection is shown three ways: tint, border and a check."
          >
            <Sub title="Choice cards" />
            <States wide>
              <State label="Default and hover">
                <ChoiceCards
                  legend="What would you like help with?"
                  name="cards-default"
                  options={[{ ...goalCards[0], preview: "hover" }, goalCards[1]]}
                />
              </State>
              <State label="Selected and focus">
                <ChoiceCards
                  legend="What would you like help with?"
                  name="cards-selected"
                  options={[{ ...goalCards[0], preview: "focus-visible" }, goalCards[1]]}
                  defaultValue="personal"
                />
              </State>
              <State label="Error">
                <ChoiceCards
                  legend="What would you like help with?"
                  name="cards-error"
                  options={goalCards}
                  error="Select what you’d like help with"
                />
              </State>
              <State label="Text only, with “Not sure”">
                <ChoiceCards
                  legend="When do you need the money?"
                  name="cards-timing"
                  options={[
                    { value: "week", label: "Within a week" },
                    { value: "month", label: "Within a month" },
                    { value: "later", label: "Later than that" },
                    { value: "not-sure", label: "I’m not sure yet", notSure: true },
                  ]}
                  defaultValue="month"
                />
              </State>
            </States>

            <Sub title="Checkbox" />
            <States>
              <State label="Unchecked">
                <Checkbox label="I have other loans or credit cards" />
              </State>
              <State label="Hover">
                <Checkbox label="I have other loans or credit cards" preview="hover" />
              </State>
              <State label="Focus">
                <Checkbox label="I have other loans or credit cards" preview="focus-visible" />
              </State>
              <State label="Checked">
                <Checkbox label="I have other loans or credit cards" defaultChecked />
              </State>
              <State label="Error">
                <Checkbox label="I have other loans or credit cards" invalid />
              </State>
              <State label="Disabled">
                <Checkbox label="I have other loans or credit cards" disabled />
              </State>
            </States>

            <Sub title="Segmented and chips" />
            <States wide>
              <State label="Segmented · 2–4 short options">
                <Segmented
                  legend="Is anyone applying with you?"
                  name="joint"
                  options={[
                    { value: "no", label: "Just me" },
                    { value: "yes", label: "With someone" },
                  ]}
                  defaultValue="no"
                />
              </State>
              <State label="Segmented · hover and focus">
                <Segmented
                  legend="Is anyone applying with you?"
                  name="joint-preview"
                  options={[
                    { value: "no", label: "Just me", preview: "focus-visible" },
                    { value: "yes", label: "With someone", preview: "hover" },
                  ]}
                />
              </State>
              <State label="Chips · multi-select, “Not sure” dashed">
                <Chips
                  legend="What matters most to you?"
                  hint="Select all that apply."
                  name="priorities"
                  options={priorities}
                  defaultValues={["lower-monthly", "flexible"]}
                />
              </State>
            </States>
            <Spec
              test="The full tile is clickable, arrow keys move between options, and selection never relies on colour alone."
              a11y="Real radio and checkbox inputs inside a fieldset with a legend; hint and error are announced with the group."
              figma="Choice / type=card / state=selected / icon=true"
            />
          </Section>

          {/* 04 Select ------------------------------------------------------- */}
          <Section
            id="select"
            index={4}
            title="Select"
            intro="For long lists only. The phone’s own picker is the most reliable option on mobile."
          >
            <States>
              <State label="Placeholder">
                <Select label="Which industry do you work in?" options={industries} />
              </State>
              <State label="Filled">
                <Select label="Which industry do you work in?" options={industries} defaultValue="healthcare" />
              </State>
              <State label="Focus">
                <Select label="Which industry do you work in?" options={industries} preview="focus" />
              </State>
              <State label="Error">
                <Select label="Which industry do you work in?" options={industries} error="Select the industry you work in" />
              </State>
              <State label="Disabled">
                <Select label="Which industry do you work in?" options={industries} disabled />
              </State>
            </States>
            <Spec
              test="Robust with the mobile picker, keyboard and screen readers."
              a11y="Native select with a visible label; the chevron is decorative."
              figma="Select / state=filled / size=lg"
            />
          </Section>

          {/* 05 Progress ----------------------------------------------------- */}
          <Section
            id="progress"
            index={5}
            title="Progress"
            intro="Named stages, never a percentage. Branching makes “75%” untrue."
          >
            <States wide>
              <State label="Step 1">
                <Stepper stages={stages} current={0} />
              </State>
              <State label="Step 3">
                <Stepper stages={stages} current={2} />
              </State>
              <State label="Narrow container: names collapse into the caption">
                <div className={styles.narrow}>
                  <Stepper stages={stages} current={1} />
                </div>
              </State>
            </States>
            <Example title="Try it">
              <StepperDemo />
            </Example>
            <Spec
              test="No misleading percentage. The current step is announced."
              a11y="An ordered list in a labelled nav. aria-current marks the step; finished and upcoming stages say so to screen readers."
              figma="Progress / stage=2 / total=4 / width=narrow"
            />
          </Section>

          {/* 06 Question heading -------------------------------------------- */}
          <Section
            id="question"
            index={6}
            title="Question heading"
            intro="The page title, why we’re asking, and room for one important note."
          >
            <States wide>
              <State label="Multi-field step">
                <QuestionHeading
                  title="Tell us a little about your situation."
                  lead="We use this to suggest a more relevant next step."
                  why="Lenders set different rules for employees and the self-employed. Your answer only narrows which routes we show you."
                  note="You can review and change every answer before you send it."
                />
              </State>
              <State label="Single-question step: the legend is the h1">
                <Fieldset legend="How much would you like to borrow?" legendStyle="page-heading" hint="An estimate is fine.">
                  <TextField label="Amount" prefix="S$" width="medium" inputMode="decimal" />
                </Fieldset>
              </State>
            </States>
            <Spec
              test="One h1 per step. “Why we ask” opens with touch, mouse and keyboard."
              a11y="Native details/summary disclosure. The h1 takes focus after each step transition."
              figma="Question / why=true / note=true"
            />
          </Section>

          {/* 07 Review summary ---------------------------------------------- */}
          <Section
            id="review"
            index={7}
            title="Review summary"
            intro="Check answers before anything is sent. “Change” goes back to that step and returns here with everything else kept."
          >
            <ReviewSummary
              groups={[
                {
                  id: "rv-goals",
                  title: "Your goals",
                  changeHref: "#review",
                  rows: [
                    { label: "What you need help with", value: "Debt consolidation" },
                    { label: "Amount", value: "S$25,000" },
                  ],
                },
                {
                  id: "rv-situation",
                  title: "Your situation",
                  changeHref: "#review",
                  rows: [
                    { label: "Employment", value: "Full-time employee" },
                    { label: "Industry", value: "Healthcare" },
                    { label: "Monthly income", value: null },
                  ],
                },
                {
                  id: "rv-preferences",
                  title: "Preferences",
                  rows: [
                    { label: "What matters most", value: "Lower monthly repayments, Flexible terms", changeHref: "#review" },
                    { label: "When you need it", value: "Within a month", changeHref: "#review" },
                  ],
                },
              ]}
            />
            <Spec
              test="“Change” returns to review with other values kept. Unanswered optional questions show “Not provided”, never 0."
              a11y="A description list per group. Each “Change” link has hidden context, e.g. “Change your goals”."
              figma="Review / group=true / row-change=false / missing=true"
            />
          </Section>

          {/* 19 Consent ------------------------------------------------------ */}
          <Section
            id="consent"
            index={8}
            title="Consent group"
            intro="What’s required to handle the request is a plain notice. Marketing is separate, optional and unticked."
          >
            <ConsentGroup
              policyVersion="2026-10-draft"
              privacyHref="#consent"
              processing="We use your answers to find loan routes that may suit you, and to contact you about this request only."
              marketing={[
                { name: "marketing_email", label: "Email me tips and updates from DFX", hint: "You can unsubscribe at any time." },
                {
                  name: "marketing_whatsapp",
                  label: "Send me updates on WhatsApp",
                  hint: "Separate from messages about this request. Reply STOP at any time.",
                },
              ]}
            />
            <Spec
              test="Optional boxes start unticked; the policy version is submitted with the answers; continuing never depends on marketing."
              a11y="Marketing permissions sit in their own fieldset marked (optional)."
              figma="Consent / marketing-channels=2"
            />
          </Section>

          {/* Assembled ------------------------------------------------------- */}
          <Section
            id="assembled"
            index={9}
            title="Assembled: step A1"
            intro="The parts above composed into the first assessment step. Press Continue without choosing to see the error handling."
          >
            <div className={styles.frame}>
              <AssessmentStepDemo />
            </div>
          </Section>

          <Section
            id="decisions"
            index={10}
            title="Decisions"
            intro="Calls I made in this batch. Confirm or change them before the assessment screens (Part 4) build on them."
          >
            <ol className={ds.signoff}>
              {decisions.map(({ question, proposal }) => (
                <li key={question}>
                  <h3 className="type-h3">{question}</h3>
                  <p>{proposal}</p>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </main>
  );
}
