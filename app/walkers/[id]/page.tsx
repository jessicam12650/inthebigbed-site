import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WALKERS } from "@/data/walkers";
import TierBadge from "@/components/TierBadge";
import Rating from "@/components/Rating";
import BookingCTA from "@/components/BookingCTA";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return WALKERS.map((w) => ({ id: w.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const walker = WALKERS.find((w) => w.id === params.id);
  if (!walker) return {};
  return {
    title: `${walker.name} — dog walker in ${walker.area}`,
    description: walker.bio,
  };
}

export default function WalkerDetailPage({ params }: { params: Params }) {
  const walker = WALKERS.find((w) => w.id === params.id);
  if (!walker) notFound();

  return (
    <article className="bg-cream">
      <section className="px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/walkers"
            className="mb-6 inline-flex items-center gap-1 text-sm font-sub text-ink/60 transition-opacity hover:opacity-80"
          >
            ← All walkers
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-head text-4xl tracking-tight text-ink md:text-5xl">{walker.name}</h1>
              <p className="mt-1 text-base text-ink/60">
                {walker.area} · {walker.distance}
              </p>
            </div>
            <TierBadge tier={walker.tier} />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Rating rating={walker.rating} reviews={walker.reviews} />
            {walker.available ? (
              <span className="chip border-sage/30 bg-sage/10 text-sage">Available now</span>
            ) : (
              <span className="chip border-ink/15 text-ink/55">Currently full</span>
            )}
          </div>

          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink/80">{walker.bio}</p>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Per walk</div>
            <div className="mt-2 font-head text-3xl text-ink">£{walker.pricePerWalk}</div>
            <div className="mt-1 text-sm text-ink/55">
              No surge pricing on bank holidays or Christmas.
            </div>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Walk lengths</div>
            <div className="mt-2 font-head text-2xl text-ink">{walker.durationOptions.join(" / ")}</div>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Group size</div>
            <div className="mt-2 font-head text-2xl text-ink">Up to {walker.maxDogs} dogs</div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 font-head text-2xl text-ink">What {walker.name.split(" ")[0]} offers</h2>
          <ul className="flex flex-wrap gap-2">
            {walker.features.map((f) => (
              <li key={f} className="chip">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink px-5 py-12 text-cream md:px-12 md:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-head text-2xl text-cream md:text-3xl">Ready to book?</h2>
            <p className="mt-1 text-sm text-cream/70">
              Send {walker.name.split(" ")[0]} a request — they'll confirm within a few hours.
            </p>
          </div>
          <BookingCTA
            kind="walker"
            id={walker.id}
            available={walker.available}
            label="Request a walk"
          />
        </div>
      </section>
    </article>
  );
}
