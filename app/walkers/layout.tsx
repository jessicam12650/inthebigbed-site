import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog walkers in Liverpool",
  description:
    "Verified, insured dog walkers across Liverpool — DBS checked on Gold and Pro tiers. Filter by area, tier and availability.",
};

export default function WalkersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
