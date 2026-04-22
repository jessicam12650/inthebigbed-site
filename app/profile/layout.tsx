import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Your In The Big Bed dashboard and dog profiles.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
