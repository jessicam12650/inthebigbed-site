import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GROOMERS } from "@/data/groomers";
import Rating from "@/components/Rating";
import BookingCTA from "@/components/BookingCTA";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return GROOMERS.map((g) => ({ id: g.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const groomer = GROOMERS.find((g) => g.id === params.id);
  if (!groomer) return {};
  return {
    title: `${groomer.name} — dog groomer in ${groomer.area}`,
    description: groomer.bio,
  };
}

export default function GroomerDetailPage({ params }: { params: Params }) {
  const groomer = GROOMERS.find((g) => g.id === params.id);
  if (!groomer) notFound();

  const isMobile = groomer.type === "mobile";

  return (
    <article className="bg-cream">
      <section className="px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/groomers"
            className="mb-6 inline-flex items-center gap-1 text-sm font-sub text-ink/60 transition-opacity hover:opacity-80"
          >
            ← All groomers
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-head text-4xl tracking-tight text-ink md:text-5xl">{groomer.name}</h1>
              <p className="mt-1 text-base text-ink/60">
                {isMobile ? `Mobile · ${groomer.region ?? groomer.area}` : `${groomer.area} · ${groomer.distance}`}
              </p>
            </div>
            <span
              className={`tier-badge ${
                isMobile ? "border-sage text-sage bg-sage/5" : "border-rust text-rust bg-rust/5"
              }`}
            >
              {isMobile ? "🚐 Mobile" : "✂️ Salon"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rating rating={groomer.rating} reviews={groomer.reviews} />
            <span className="chip">🎓 {groomer.qualification}</span>
            {groomer.available ? (
              <span className="chip border-sage/30 bg-sage/10 text-sage">Taking bookings</span>
            ) : (
              <span className="chip border-ink/15 text-ink/55">Currently full</span>
            )}
          </div>

          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink/80">{groomer.bio}</p>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Services</div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {groomer.services.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Specialism</div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {groomer.specialism.map((s) => (
                <li key={s} className="chip border-rust/30 bg-rust/5 text-rust">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-12 text-cream md:px-12 md:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-xs font-sub uppercase tracking-wider text-cream/55">From</div>
            <div className="mt-1 font-head text-4xl text-cream">£{groomer.priceFrom}</div>
            <p className="mt-2 text-sm text-cream/70">
              Final price depends on your dog's coat, size and the service you choose.
            </p>
          </div>
          <BookingCTA
            kind="groomer"
            id={groomer.id}
            available={groomer.available}
            label="Book a groom"
          />
        </div>
      </section>
    </article>
  );
}
