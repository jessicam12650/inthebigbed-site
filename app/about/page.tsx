import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — In The Big Bed",
  description:
    "The Liverpool City Region's licensed-only dog directory. Every boarder, kennel and day care holds a current Animal Activity Licence from their local council.",
};

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-ink px-6 py-20 text-center md:px-12 md:py-28 md:text-left">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 font-head text-5xl font-black leading-[1.05] tracking-tight text-cream md:text-6xl lg:text-7xl">
            About In The Big Bed
          </h1>
          <h2 className="font-head text-2xl leading-tight text-rust md:text-3xl">
            The Liverpool City Region&apos;s licensed-only dog directory.
          </h2>
        </div>
      </section>

      {/* INTRO */}
      <section className="section bg-cream">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg leading-relaxed text-ink/80 md:text-xl">
            Every boarder, kennel and day care on this site holds a current Animal Activity Licence
            from their council — Liverpool, Sefton, Knowsley, St Helens. We sourced the directory
            from the public council registers themselves.
          </p>

          <p className="mt-12 font-head text-3xl leading-snug text-rust md:text-4xl">
            If they&apos;re not licensed, they&apos;re not on here.
          </p>
        </div>
      </section>

      {/* WHY LICENSED-ONLY */}
      <section className="section bg-cream border-t border-ink/10">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-head text-3xl text-ink md:text-4xl">Why licensed-only?</h2>
          <p className="text-base leading-relaxed text-ink/80 md:text-[17px]">
            Boarding dogs for money is legally regulated in the UK. Licensed operators are
            inspected, star-rated, and accountable. Unlicensed ones aren&apos;t.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/80 md:text-[17px]">
            We made that the entire point of the site.
          </p>
        </div>
      </section>

      {/* FOR DOG OWNERS */}
      <section className="section bg-cream border-t border-ink/10">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-head text-3xl text-ink md:text-4xl">For dog owners</h2>
          <p className="text-base leading-relaxed text-ink/80 md:text-[17px]">
            Browse, enquire, arrange directly with the boarder. No fees. No markups. No middlemen.
          </p>
        </div>
      </section>

      {/* FOR PROVIDERS */}
      <section className="section bg-ink">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-head text-3xl text-cream md:text-4xl">
            For boarders, kennels and day cares
          </h2>
          <p className="text-base leading-relaxed text-cream/80 md:text-[17px]">
            If you&apos;re licensed by Liverpool, Sefton, Knowsley or St Helens Council, you&apos;re
            already on here.
          </p>
          <p className="mt-4 text-base leading-relaxed text-cream/80 md:text-[17px]">
            Your profile is currently unclaimed — name, licence number and star rating only. Claim
            it to add your photos, your prices, and start receiving enquiries directly.
          </p>
          <p className="mt-6 font-head text-2xl text-rust md:text-3xl">
            Free to claim. Free to receive enquiries.
          </p>
          <Link href="/signup" className="btn-primary btn-block-mobile mt-8 px-7 py-4 text-base">
            Claim your profile
          </Link>
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="section bg-cream">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-head text-3xl text-ink md:text-4xl">What&apos;s next</h2>
          <p className="text-base leading-relaxed text-ink/80 md:text-[17px]">
            Wirral and Halton councils — registers on their way. Every newly licensed operator gets
            added.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/80 md:text-[17px]">
            Licensed and not seeing your business?
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink/80 md:text-[17px]">
            Email us at{" "}
            <a
              href="mailto:hello@inthebigbed.co.uk"
              className="font-sub text-rust underline hover:opacity-80"
            >
              hello@inthebigbed.co.uk
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
