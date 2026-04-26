import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boarding in Liverpool",
  description:
    "Licensed dog home boarders and kennels across Liverpool, Sefton and Knowsley. Every operator holds a current council licence.",
};

export default function BoardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
