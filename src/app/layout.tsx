import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SkipLink } from "@/components/nav/SkipLink";
import "@/styles/tokens.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DFX",
    template: "%s · DFX",
  },
  description: "Check your loan options in a few short questions, then decide whether to speak with the DFX team.",
};

export const viewport: Viewport = {
  themeColor: "#F7F6F2",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next turns smooth scrolling off while it changes page, so new pages start at the top at once.
    <html lang="en-SG" className={`${inter.variable} ${plusJakarta.variable}`} data-scroll-behavior="smooth">
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
