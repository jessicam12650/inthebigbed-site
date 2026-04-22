import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find my dog — emergency alert",
  description:
    "One tap alerts every In The Big Bed user within 2 miles. The whole community helps you find your lost dog.",
  robots: { index: false, follow: true },
};

export default function LostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
