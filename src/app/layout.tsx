import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { SkipLink } from "@/components/nav/SkipLink";
import "@/styles/tokens.css";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});


const description = "Check your loan options in a few short questions, then decide whether to speak with the DFX team.";

export const metadata: Metadata = {
  // The live domain is DFX's to choose: set SITE_URL once it exists. Until then Next uses the deployment's own URL.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: {
    default: "DFX",
    template: "%s · DFX",
  },
  description,
  // Icons and share images come from the files in this folder (scripts/render-brand.mjs).
  openGraph: {
    siteName: "DFX",
    title: "DFX · Find the loan route that fits you",
    description,
    locale: "en_SG",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#F6F5F1",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next turns smooth scrolling off while it changes page, so new pages start at the top at once.
    <html lang="en-SG" className={schibsted.variable} data-scroll-behavior="smooth">
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
