import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find my dog — emergency alert",
  description:
    "Report your lost dog to In The Big Bed in seconds, with a photo and last-seen location, so the community can help you look.",
  robots: { index: false, follow: true },
};

export default function LostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
