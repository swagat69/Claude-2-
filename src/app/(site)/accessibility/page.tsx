import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { InfoPage, InfoSection } from "../_shared/InfoPage";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "How DFX meets WCAG 2.2 AA, what we test, and how to tell us when something gets in your way.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Accessibility"
      lead="Everyone should be able to find out what they can borrow without help. We design to WCAG 2.2 at level AA."
      updated={business.policyDate}
      note="Manual check with screen readers (VoiceOver, NVDA, TalkBack) before launch"
    >
      <InfoSection title="What we’ve built in">
        <ul>
          <li>Every page and step works with a keyboard alone, with a visible focus outline.</li>
          <li>
            Questions are labelled for screen readers, and errors are listed at the top of the step and beside the
            question.
          </li>
          <li>Pages fit a screen 320 pixels wide and text can be enlarged to 200% without scrolling sideways.</li>
          <li>Text and controls meet AA colour contrast, and Windows high contrast mode is supported.</li>
          <li>Movement is reduced or turned off if your device asks for less motion.</li>
          <li>
            You can take your time: your answers stay in this tab until you’ve left them for {business.draftHours} hour.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="How we check">
        <p>
          Every page, and every state of the assessment, results and booking, is tested automatically against WCAG 2.2
          AA on desktop and phone sizes before each release, along with keyboard-only paths through the forms.
        </p>
      </InfoSection>

      <InfoSection title="Known gaps">
        <p>
          Automated tests can’t catch everything. We haven’t yet had the site checked by people using screen readers,
          and we’ll list anything they find here, with a date for the fix.
        </p>
      </InfoSection>

      <InfoSection title="Tell us">
        <p>
          If anything gets in your way, <Link href="/contact">contact us</Link> and tell us how you’d like us to reply.
          We reply {business.support.replyTime}. If a form doesn’t work for you, a loan specialist can go through the
          questions with you on a call instead.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
