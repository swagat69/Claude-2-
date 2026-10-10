import type { Metadata } from "next";
import { ButtonLink } from "@/components/button/Button";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/nav/SiteFooter";
import { navLinks, navCta } from "@/config/site";

export const metadata: Metadata = { title: "Page not found" };
export default function NotFound() {
  return <><SiteHeader links={navLinks} cta={navCta} /><main id="main" className="container" style={{ paddingBlock: 96, minHeight: "60vh" }}>
    <h1 className="type-display-l">We can’t find that page</h1>
    <p style={{ marginBlock: 24 }}>The link may be old or mistyped.</p>
    <ButtonLink href="/">Go to the homepage</ButtonLink>{" "}<ButtonLink href="/assessment" variant="tertiary">Start assessment</ButtonLink>
  </main><SiteFooter /></>;
}
