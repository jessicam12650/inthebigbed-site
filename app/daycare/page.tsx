"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DAYCARES } from "@/data/daycares";
import type { Tier } from "@/data/walkers";
import TierBadge from "@/components/TierBadge";
import Rating from "@/components/Rating";
import PageHeader from "@/components/PageHeader";
import FilterChip from "@/components/FilterChip";
import FilterCheckbox from "@/components/FilterCheckbox";
import EmptyState from "@/components/EmptyState";

const TIER_FILTERS: Array<{ value: "all" | Tier; label: string }> = [
  { value: "all", label: "All tiers" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "pro", label: "Pro" },
];

type CouncilFilter = "all" | "Liverpool" | "Sefton" | "Knowsley";

const COUNCIL_FILTERS: Array<{ value: CouncilFilter; label: string }> = [
  { value: "all", label: "All councils" },
  { value: "Liverpool", label: "Liverpool" },
  { value: "Sefton", label: "Sefton" },
  { value: "Knowsley", label: "Knowsley" },
];

const COUNCIL_LABELS: Record<"Liverpool" | "Sefton" | "Knowsley", string> = {
  Liverpool: "Liverpool City Council",
  Sefton: "Sefton Council",
  Knowsley: "Knowsley Council",
};

function licensedByLine(d: { council?: "Liverpool" | "Sefton" | "Knowsley"; licenceNumber: string }) {
  const council = d.council ?? "Liverpool";
  const label = COUNCIL_LABELS[council];
  if (d.licenceNumber === "—") return `Licensed by ${label} (licence number pending)`;
  return `Licensed by ${label} · ${d.licenceNumber}`;
}

export default function DaycarePage() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | Tier>("all");
  const [council, setCouncil] = useState<CouncilFilter>("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DAYCARES.filter((d) => {
      if (tier !== "all" && d.tier !== tier) return false;
      if (council !== "all" && d.council !== council) return false;
      if (availableOnly && !d.available) return false;
      if (q) {
        const hay = `${d.name} ${d.area} ${d.licenceNumber} ${d.features.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, tier, council, availableOnly]);

  return (
    <>
      <PageHeader
        eyebrow="Licensed day care"
        title="Dog day care in Liverpool."
        subtitle="Licensed daytime care for working dog owners. Every operator on this page is licensed and star-rated by Liverpool City Council."
      />

      <section className="border-b border-ink/10 bg-cream px-5 py-5 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-sub text-sm leading-snug text-ink">
            Every day care on this page is licensed and star-rated by Liverpool City Council. We only list the legal ones.
          </p>
          <p className="mt-1 text-xs text-ink/60">
            Source: Liverpool City Council Animal Activity Licenced Operators register, April 2026.
          </p>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-cream px-5 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, or licence number…"
            className="field flex-1"
            aria-label="Search day cares"
          />
          <div className="flex flex-wrap items-center gap-2">
            {COUNCIL_FILTERS.map((c) => (
              <FilterChip
                key={c.value}
                active={council === c.value}
                onClick={() => setCouncil(c.value)}
              >
                {c.label}
              </FilterChip>
            ))}
            {TIER_FILTERS.map((t) => (
              <FilterChip key={t.value} active={tier === t.value} onClick={() => setTier(t.value)}>
                {t.label}
              </FilterChip>
            ))}
            <FilterCheckbox checked={availableOnly} onChange={setAvailableOnly}>
              Available now
            </FilterCheckbox>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-sm text-ink/60">
            {filtered.length} {filtered.length === 1 ? "day care" : "day cares"} found
          </div>
          {filtered.length === 0 ? (
            <EmptyState>No day cares match your filters.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((d) => {
                if (!d.claimed) {
                  return (
                    <div
                      key={d.id}
                      className="flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6"
                    >
                      <header className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-head text-xl text-ink">{d.name}</h3>
                          <p className="mt-1 text-xs text-ink/60">{licensedByLine(d)}</p>
                          <p className="mt-1 text-sm text-ink/60">{d.area}</p>
                        </div>
                        <span className="chip border-sage/30 bg-sage/10 text-sage">
                          Council Licensed ✓
                        </span>
                      </header>

                      {d.rating > 0 ? (
                        <div
                          className="flex items-center gap-1"
                          aria-label={`${d.council ?? "Liverpool"} council rating: ${d.rating} out of 5`}
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              aria-hidden
                              className={`text-lg ${i <= d.rating ? "text-rust" : "text-ink/20"}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1.5 text-sm font-sub text-ink/70">
                            {d.rating}/5 council rating
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-ink/55">Council star rating not yet published</p>
                      )}

                      <Link
                        href={`/signup?claim=${d.id}`}
                        className="btn-outline btn-block-mobile mt-auto"
                      >
                        Claim this profile
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={d.id}
                    href={`/daycare/${d.id}`}
                    className="group flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-pop"
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-head text-xl text-ink">{d.name}</h3>
                        <p className="mt-0.5 text-sm text-ink/60">
                          {d.area} · {d.distance}
                        </p>
                      </div>
                      <TierBadge tier={d.tier} />
                    </header>

                    <div className="flex flex-wrap items-center gap-3">
                      <Rating rating={d.rating} reviews={d.reviews} />
                      <span className="chip border-sage/30 bg-sage/10 text-sage">
                        🏛 Licence {d.licenceNumber}
                      </span>
                    </div>

                    {d.capacityAlert && (
                      <div className="rounded-sm border border-rust/30 bg-rust/10 px-3 py-2 text-sm font-sub text-rust">
                        ⚡ {d.capacityAlert}
                      </div>
                    )}

                    <dl className="grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-sm">
                      <div>
                        <dt className="text-ink/50">Max dogs</dt>
                        <dd className="font-sub text-ink">{d.maxDogs}</dd>
                      </div>
                      <div>
                        <dt className="text-ink/50">Per day</dt>
                        <dd className="font-head text-xl text-ink">£{d.pricePerDay}</dd>
                      </div>
                    </dl>

                    <ul className="flex flex-wrap gap-1.5">
                      {d.features.map((f) => (
                        <li key={f} className="chip">
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center justify-end pt-2">
                      <span
                        className={`text-sm font-sub ${
                          d.available ? "text-rust group-hover:underline" : "text-ink/40"
                        }`}
                      >
                        {d.available ? "View profile →" : "Currently unavailable"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
