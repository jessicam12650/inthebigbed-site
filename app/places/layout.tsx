import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog-friendly places in Liverpool",
  description:
    "Handpicked pubs, bars, cafes and restaurants across Liverpool that welcome dogs. Mapped and searchable.",
};

export default function PlacesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
