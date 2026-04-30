import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog-friendly places in Liverpool",
  description:
    "Handpicked pubs, bars, cafes and restaurants across Liverpool that welcome dogs. Mapped and searchable.",
};

export default function PlacesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* On mobile the places page is a full-bleed map with a bottom sheet,
       * so the global site footer would push the map up and break the
       * "feels like a maps app" intent. Hide it below the md breakpoint —
       * desktop layout is unchanged. */}
      <style>{`
        @media (max-width: 767px) {
          body > footer { display: none !important; }
        }
      `}</style>
      {children}
    </>
  );
}
