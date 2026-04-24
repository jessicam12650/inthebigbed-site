import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BOARDERS } from "@/data/boarders";
import TierBadge from "@/components/TierBadge";
import Rating from "@/components/Rating";
import BookingCTA from "@/components/BookingCTA";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return BOARDERS.map((b) => ({ id: b.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const boarder = BOARDERS.find((b) => b.id === params.id);
  if (!boarder) return {};
  return {
    title: `${boarder.name} — licensed dog boarder in ${boarder.area}`,
    description: `Licensed dog boarding in ${boarder.area}. Liverpool City Council licence ${boarder.licenceNumber}.`,
  };
}

export default function BoarderDetailPage({ params }: { params: Params }) {
  const boarder = BOARDERS.find((b) => b.id === params.id);
  if (!boarder) notFound();

  if (!boarder.claimed) {
    return (
      <article className="bg-cream">
        <section className="px-5 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/boarding"
              className="mb-6 inline-flex items-center gap-1 text-sm font-sub text-ink/60 transition-opacity hover:opacity-80"
            >
              ← All boarders
            </Link>

            <h1 className="font-head text-4xl tracking-tight text-ink md:text-5xl">
              {boarder.name}
            </h1>
            <p className="mt-1 text-base text-ink/60">{boarder.area}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="chip border-sage/30 bg-sage/10 text-sage">
                Council Licensed ✓
              </span>
              <span className="chip border-ink/15 text-ink/70">
                LCC licence {boarder.licenceNumber}
              </span>
            </div>

            <div
              className="mt-4 flex items-center gap-1"
              aria-label={`Liverpool City Council rating: ${boarder.rating} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`text-xl ${i <= boarder.rating ? "text-rust" : "text-ink/20"}`}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-sm font-sub text-ink/70">
                {boarder.rating}/5 Liverpool City Council rating
              </span>
            </div>

            <div className="mt-8 rounded-sm border border-ink/10 bg-white p-6 md:p-8">
              <h2 className="font-head text-2xl text-ink md:text-3xl">
                This profile hasn&apos;t been claimed yet
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/75">
                {boarder.name} is licensed by Liverpool City Council but hasn&apos;t claimed their
                profile yet. If you&apos;re {boarder.name}, claim your free profile to add photos,
                prices and availability.
              </p>
              <Link
                href={`/signup?claim=${boarder.id}`}
                className="btn-primary btn-block-mobile mt-6"
              >
                Claim this profile
              </Link>
            </div>
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className="bg-cream">
      <section className="px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/boarding"
            className="mb-6 inline-flex items-center gap-1 text-sm font-sub text-ink/60 transition-opacity hover:opacity-80"
          >
            ← All boarders
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-head text-4xl tracking-tight text-ink md:text-5xl">{boarder.name}</h1>
              <p className="mt-1 text-base text-ink/60">
                {boarder.area} · {boarder.distance}
              </p>
            </div>
            <TierBadge tier={boarder.tier} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rating rating={boarder.rating} reviews={boarder.reviews} />
            <span className="chip border-sage/30 bg-sage/10 text-sage">
              🏛 LCC licence {boarder.licenceNumber}
            </span>
            {boarder.available ? (
              <span className="chip border-sage/30 bg-sage/10 text-sage">Available now</span>
            ) : (
              <span className="chip border-ink/15 text-ink/55">Currently full</span>
            )}
          </div>

          {boarder.capacityAlert && (
            <div className="mt-6 max-w-md rounded-sm border border-rust/30 bg-rust/10 px-4 py-3 text-sm font-sub text-rust">
              ⚡ {boarder.capacityAlert}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-ink/10 bg-white p-5">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Per night</div>
            <div className="mt-2 font-head text-3xl text-ink">£{boarder.pricePerNight}</div>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-5">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Location</div>
            <div className="mt-2 font-head text-lg text-ink">{boarder.location}</div>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-5">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Garden</div>
            <div className="mt-2 font-head text-lg text-ink">{boarder.garden}</div>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-5">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Max dogs</div>
            <div className="mt-2 font-head text-lg text-ink">{boarder.maxDogs}</div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 font-head text-2xl text-ink">What {boarder.name.split(" ")[0]} offers</h2>
          <ul className="flex flex-wrap gap-2">
            {boarder.features.map((f) => (
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
            <h2 className="font-head text-2xl text-cream md:text-3xl">Book a stay</h2>
            <p className="mt-1 text-sm text-cream/70">
              Send {boarder.name.split(" ")[0]} the dates and we'll confirm availability.
            </p>
          </div>
          <BookingCTA
            kind="boarder"
            id={boarder.id}
            available={boarder.available}
            label="Request to book"
          />
        </div>
      </section>
    </article>
  );
}
