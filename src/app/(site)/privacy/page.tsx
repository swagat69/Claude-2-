import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { business } from "@/config/business";
import { InfoPage, InfoSection } from "../_shared/InfoPage";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "What DFX collects, why, who receives it, how long we keep it and how to access or delete it.",
  robots: { index: false, follow: true },
};

const entity = "DFX’s registered company name, UEN and address";
const dpo = "DFX’s Data Protection Officer email address";

/**
 * Written to the Personal Data Protection Act 2012 obligations (notification,
 * consent, purpose, access and correction, retention, transfer, Do Not
 * Call). Every promise here matches what the site does; see docs/decisions.md.
 */
export default function Page() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy notice"
      lead="What we collect, why, who receives it, how long we keep it, and how to see or delete it."
      updated={`${business.policyDate} (version ${business.policyVersion})`}
      note="To be reviewed by a Singapore lawyer before launch"
    >
      <InfoSection title="Who we are">
        <p>
          <Placeholder note={entity}>DFX</Placeholder> runs this website and the loan-matching service. We decide how
          your information is used, and we’re responsible for it under Singapore’s Personal Data Protection Act (PDPA).
        </p>
        <p>
          Our Data Protection Officer answers every privacy question and request:{" "}
          <Placeholder note={dpo}>privacy email</Placeholder>.
        </p>
      </InfoSection>

      <InfoSection title="What we collect">
        <ul>
          <li>
            <strong>Your answers</strong>: what the money is for, the rough amount and timing, whether you live in
            Singapore, your age range, your work and income range, and for a business its registration and trading time.
            We ask for ranges, not exact figures.
          </li>
          <li>
            <strong>Contact details</strong>: your first name if you give it, and the mobile number or email address you
            choose to use.
          </li>
          <li>
            <strong>Call details</strong>, if you book: the time, and whether you’d like a phone or video call.
          </li>
          <li>
            <strong>Consent records</strong>: what you agreed to, through which channel, when, and the version of this
            notice you saw.
          </li>
          <li>
            <strong>Site use</strong>: which steps are used, as codes and counts, through Google Analytics cookies.
            Never your answers or contact details.
          </li>
        </ul>
        <p>We don’t ask for your NRIC or FIN, and answering our questions doesn’t involve a credit check.</p>
      </InfoSection>

      <InfoSection title="Why we use it">
        <ul>
          <li>To prepare your result: the kinds of loan that may fit, and why.</li>
          <li>To contact you about your result through the channel you chose.</li>
          <li>To arrange and hold a call, if you book one.</li>
          <li>To introduce you to a lender, only if you agree to that lender.</li>
          <li>To keep a record of what you agreed to.</li>
          <li>To improve the site, using counts that don’t identify you.</li>
          <li>
            To send occasional tips and offers, only if you ticked a box for them. You can stop them at any time: use
            the unsubscribe link, or reply STOP on WhatsApp.
          </li>
        </ul>
        <p>We don’t sell your information, and we don’t use it to make lending decisions. Lenders make those.</p>
      </InfoSection>

      <InfoSection title="Who receives it">
        <ul>
          <li>
            <strong>Our team</strong>: your answers and contact details, kept in our customer system (
            {business.processors.crm}).
          </li>
          <li>
            <strong>{business.processors.whatsapp}</strong>, if you choose WhatsApp: your mobile number and a short
            reference code. Never your answers.
          </li>
          <li>
            <strong>Our email service ({business.processors.email})</strong>, if you choose email: your email address
            and a secure link. Never your answers.
          </li>
          <li>
            <strong>{business.processors.analytics}</strong>: codes and counts only.
          </li>
          <li>
            <strong>Lenders</strong>: nothing, unless you agree, on a call or in writing, to be introduced to a named
            lender. Then we share only what that lender needs to consider your application.
          </li>
          <li>
            <strong>Authorities</strong>: only when the law requires it.
          </li>
        </ul>
        <p>
          Service providers act only on our instructions, under contracts that require them to protect your information.
        </p>
      </InfoSection>

      <InfoSection title="Where it’s stored">
        <p>
          Some of our service providers store information outside Singapore. When they do, we make sure by contract that
          it is protected to a standard comparable to the PDPA.
        </p>
      </InfoSection>

      <InfoSection title="How long we keep it">
        <ul>
          <li>
            <strong>Answers you haven’t sent</strong> stay in this browser tab only. They’re cleared when you close the
            tab, choose Start again, or leave them for {business.draftHours} hour.
          </li>
          <li>
            <strong>Answers and contact details you’ve sent</strong> are deleted {business.retentionDays} days after
            your last activity with us.
          </li>
          <li>
            <strong>If you go ahead with a lender</strong>, we keep a record of the introduction (your name, the lender
            and the date) for 5 years, as Singapore law requires for business records.
          </li>
          <li>
            <strong>Consent to tips and offers</strong> lasts until you withdraw it.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Your choices">
        <ul>
          <li>Ask what information we hold about you, and how we’ve used it in the past year.</li>
          <li>Ask us to correct anything that’s wrong.</li>
          <li>
            Withdraw your consent at any time. We’ll stop using your information and delete it, unless the law requires
            us to keep it.
          </li>
          <li>Ask us to delete your information sooner.</li>
        </ul>
        <p>
          Write to our Data Protection Officer. We reply within 30 days. If you’re unhappy with our answer, you can
          contact the{" "}
          <a href="https://www.pdpc.gov.sg/" rel="noopener">
            Personal Data Protection Commission
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection title="How we protect it">
        <ul>
          <li>Information is encrypted between your device and our systems.</li>
          <li>Secure links work once, for {business.linkMinutes} minutes.</li>
          <li>Only the people who prepare your result and your call can see your answers.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Changes to this notice">
        <p>
          When we change this notice, we update the date above. If a change affects what you agreed to, we’ll ask you
          again before it applies. Read our <Link href="/terms">terms of use</Link> too.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
