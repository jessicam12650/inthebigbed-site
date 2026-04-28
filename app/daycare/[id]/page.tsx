import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DAYCARES } from "@/data/daycares";
import TierBadge from "@/components/TierBadge";
import Rating from "@/components/Rating";
import EnquirySection from "@/components/EnquirySection";

type Params = { id: string };

const COUNCIL_LABELS: Record<"Liverpool" | "Sefton" | "Knowsley" | "St Helens", string> = {
  Liverpool: "Liverpool City Council",
  Sefton: "Sefton Council",
  Knowsley: "Knowsley Council",
  "St Helens": "St Helens Council",
};

function councilLabel(council?: "Liverpool" | "Sefton" | "Knowsley" | "St Helens") {
  return COUNCIL_LABELS[council ?? "Liverpool"];
}

export function generateStaticParams(): Params[] {
  return DAYCARES.map((d) => ({ id: d.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const daycare = DAYCARES.find((d) => d.id === params.id);
  if (!daycare) return {};
  const label = councilLabel(daycare.council);
  const licenceClause =
    daycare.licenceNumber === "—"
      ? `${label} licence (number pending verification)`
      : `${label} licence ${daycare.licenceNumber}`;
  return {
    title: `${daycare.name} — licensed dog day care in ${daycare.area}`,
    description: `Licensed dog day care in ${daycare.area}. ${licenceClause}.`,
  };
}

export default function DaycareDetailPage({ params }: { params: Params }) {
  const daycare = DAYCARES.find((d) => d.id === params.id);
  if (!daycare) notFound();

  if (!daycare.claimed) {
    return (
      <article className="bg-cream">
        <section className="px-5 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/daycare"
              className="mb-6 inline-flex items-center gap-1 text-sm font-sub text-ink/60 transition-opacity hover:opacity-80"
            >
              ← All day cares
            </Link>

            <h1 className="font-head text-4xl tracking-tight text-ink md:text-5xl">
              {daycare.name}
            </h1>
            <p className="mt-1 text-base text-ink/60">{daycare.area}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="chip border-sage/30 bg-sage/10 text-sage">
                Council Licensed ✓
              </span>
              <span className="chip border-ink/15 text-ink/70">
                {daycare.licenceNumber === "—"
                  ? `${councilLabel(daycare.council)} (licence number pending)`
                  : `${councilLabel(daycare.council)} licence ${daycare.licenceNumber}`}
              </span>
            </div>

            {daycare.rating > 0 ? (
              <div
                className="mt-4 flex items-center gap-1"
                aria-label={`${councilLabel(daycare.council)} rating: ${daycare.rating} out of 5`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={`text-xl ${i <= daycare.rating ? "text-rust" : "text-ink/20"}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm font-sub text-ink/70">
                  {daycare.rating}/5 {councilLabel(daycare.council)} rating
                </span>
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink/60">
                {councilLabel(daycare.council)} star rating not yet published.
              </p>
            )}

            <div className="mt-8 rounded-sm border border-ink/10 bg-white p-6 md:p-8">
              <h2 className="font-head text-2xl text-ink md:text-3xl">
                This profile hasn&apos;t been claimed yet
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/75">
                {daycare.name} is licensed by {councilLabel(daycare.council)} but hasn&apos;t claimed
                their profile yet. If you&apos;re {daycare.name}, claim your free profile to add
                photos, prices and availability.
              </p>
              <Link
                href={`/signup?claim=${daycare.id}`}
                className="btn-primary btn-block-mobile mt-6"
              >
                Claim this profile
              </Link>
            </div>

            <section className="mt-10 rounded-sm bg-ink p-6 md:p-8">
              <h2 className="font-head text-2xl text-cream md:text-3xl">Send an enquiry</h2>
              <p className="mb-5 mt-1 text-sm text-cream/70">
                We&apos;ll forward your message to {daycare.name} on your behalf.
              </p>
              <EnquirySection
                providerKind="daycare"
                providerId={daycare.id}
                providerName={daycare.name}
                claimed={false}
                browseHref="/daycare"
                browseLabel="Browse more licensed day cares"
              />
            </section>
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
            href="/daycare"
            className="mb-6 inline-flex items-center gap-1 text-sm font-sub text-ink/60 transition-opacity hover:opacity-80"
          >
            ← All day cares
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-head text-4xl tracking-tight text-ink md:text-5xl">{daycare.name}</h1>
              <p className="mt-1 text-base text-ink/60">
                {daycare.area} · {daycare.distance}
              </p>
            </div>
            <TierBadge tier={daycare.tier} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rating rating={daycare.rating} reviews={daycare.reviews} />
            <span className="chip border-sage/30 bg-sage/10 text-sage">
              🏛 {daycare.licenceNumber === "—"
                ? `${councilLabel(daycare.council)} (licence pending)`
                : `${councilLabel(daycare.council)} licence ${daycare.licenceNumber}`}
            </span>
            {daycare.available ? (
              <span className="chip border-sage/30 bg-sage/10 text-sage">Available now</span>
            ) : (
              <span className="chip border-ink/15 text-ink/55">Currently full</span>
            )}
          </div>

          {daycare.capacityAlert && (
            <div className="mt-6 max-w-md rounded-sm border border-rust/30 bg-rust/10 px-4 py-3 text-sm font-sub text-rust">
              ⚡ {daycare.capacityAlert}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4">
          <div className="rounded-sm border border-ink/10 bg-white p-5">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Per day</div>
            <div className="mt-2 font-head text-3xl text-ink">£{daycare.pricePerDay}</div>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white p-5">
            <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Max dogs</div>
            <div className="mt-2 font-head text-lg text-ink">{daycare.maxDogs}</div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12 md:px-12 md:pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 font-head text-2xl text-ink">What {daycare.name} offers</h2>
          <ul className="flex flex-wrap gap-2">
            {daycare.features.map((f) => (
              <li key={f} className="chip">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink px-5 py-12 text-cream md:px-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-head text-2xl text-cream md:text-3xl">Send an enquiry</h2>
          <p className="mt-1 text-sm text-cream/70">
            Send {daycare.name} your dates and dog details — we&apos;ll pass it on.
          </p>
          <div className="mt-6">
            <EnquirySection
              providerKind="daycare"
              providerId={daycare.id}
              providerName={daycare.name}
              claimed={true}
              browseHref="/daycare"
              browseLabel="Browse more licensed day cares"
            />
          </div>
        </div>
      </section>
    </article>
  );
}
