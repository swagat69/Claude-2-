import type { ReactNode } from "react";
import { ToastProvider } from "@/components/feedback/Toast";
import { SiteFooter } from "@/components/nav/SiteFooter";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { navCta, navLinks } from "@/config/site";

/** Public site: homepage, assessment and supporting pages share the header and footer. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SiteHeader links={navLinks} cta={navCta} />
      {children}
      <SiteFooter />
    </ToastProvider>
  );
}
