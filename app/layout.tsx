import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const SITE_NAME = "In The Big Bed";
const SITE_DESC =
  "Everything for dogs. And the people they allow in the bed. Verified walkers, licensed boarders, groomers, vets and dog-friendly places across Liverpool.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://inthebigbed.com"),
  title: {
    default: "inthebigbed — Liverpool's dog platform",
    template: "%s · inthebigbed",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "inthebigbed — Liverpool's dog platform",
    description: SITE_DESC,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "inthebigbed — Liverpool's dog platform",
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
