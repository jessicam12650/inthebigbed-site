import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog groomers in Liverpool",
  description:
    "Qualified dog groomers across Liverpool — salons and mobile vans. City & Guilds and iPET Network accredited.",
};

export default function GroomersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
