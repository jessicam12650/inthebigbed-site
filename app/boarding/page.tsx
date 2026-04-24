"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BOARDERS } from "@/data/boarders";
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

export default function BoardingPage() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | Tier>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [gardenOnly, setGardenOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOARDERS.filter((b) => {
      if (tier !== "all" && b.tier !== tier) return false;
      if (availableOnly && !b.available) return false;
      if (gardenOnly && !b.garden.toLowerCase().includes("enclosed")) return false;
      if (q) {
        const hay = `${b.name} ${b.area} ${b.licenceNumber} ${b.features.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, tier, availableOnly, gardenOnly]);

  return (
    <>
      <PageHeader
        eyebrow="Licensed boarders"
        title="Boarding & daycare in Liverpool."
        subtitle="Every boarder holds a current home boarding licence from Liverpool City Council. Licence numbers shown on every listing."
      />

      <section className="border-b border-ink/10 bg-cream px-5 py-5 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-sub text-sm leading-snug text-ink">
            Every boarder on this page is licensed and star-rated by Liverpool City Council. We only list the legal ones.
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
            aria-label="Search boarders"
          />
          <div className="flex flex-wrap items-center gap-2">
            {TIER_FILTERS.map((t) => (
              <FilterChip key={t.value} active={tier === t.value} onClick={() => setTier(t.value)}>
                {t.label}
              </FilterChip>
            ))}
            <FilterCheckbox checked={gardenOnly} onChange={setGardenOnly}>
              Enclosed garden
            </FilterCheckbox>
            <FilterCheckbox checked={availableOnly} onChange={setAvailableOnly}>
              Available now
            </FilterCheckbox>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-sm text-ink/60">
            {filtered.length} {filtered.length === 1 ? "boarder" : "boarders"} found
          </div>
          {filtered.length === 0 ? (
            <EmptyState>No boarders match your filters.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((b) => {
                if (!b.claimed) {
                  return (
                    <div
                      key={b.id}
                      className="flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6"
                    >
                      <header className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-head text-xl text-ink">{b.name}</h3>
                          <p className="mt-1 text-xs text-ink/60">
                            Licensed by Liverpool City Council · {b.licenceNumber}
                          </p>
                          <p className="mt-1 text-sm text-ink/60">{b.area}</p>
                        </div>
                        <span className="chip border-sage/30 bg-sage/10 text-sage">
                          Council Licensed ✓
                        </span>
                      </header>

                      <div
                        className="flex items-center gap-1"
                        aria-label={`Liverpool City Council rating: ${b.rating} out of 5`}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            aria-hidden
                            className={`text-lg ${i <= b.rating ? "text-rust" : "text-ink/20"}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-1.5 text-sm font-sub text-ink/70">
                          {b.rating}/5 council rating
                        </span>
                      </div>

                      <Link
                        href={`/signup?claim=${b.id}`}
                        className="btn-outline btn-block-mobile mt-auto"
                      >
                        Claim this profile
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={b.id}
                    href={`/boarding/${b.id}`}
                    className="group flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-pop"
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-head text-xl text-ink">{b.name}</h3>
                        <p className="mt-0.5 text-sm text-ink/60">
                          {b.area} · {b.distance}
                        </p>
                      </div>
                      <TierBadge tier={b.tier} />
                    </header>

                    <div className="flex flex-wrap items-center gap-3">
                      <Rating rating={b.rating} reviews={b.reviews} />
                      <span className="chip border-sage/30 bg-sage/10 text-sage">
                        🏛 Licence {b.licenceNumber}
                      </span>
                    </div>

                    {b.capacityAlert && (
                      <div className="rounded-sm border border-rust/30 bg-rust/10 px-3 py-2 text-sm font-sub text-rust">
                        ⚡ {b.capacityAlert}
                      </div>
                    )}

                    <dl className="grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-sm">
                      <div>
                        <dt className="text-ink/50">Location</dt>
                        <dd className="font-sub text-ink">{b.location}</dd>
                      </div>
                      <div>
                        <dt className="text-ink/50">Garden</dt>
                        <dd className="font-sub text-ink">{b.garden}</dd>
                      </div>
                      <div>
                        <dt className="text-ink/50">Max dogs</dt>
                        <dd className="font-sub text-ink">{b.maxDogs}</dd>
                      </div>
                      <div>
                        <dt className="text-ink/50">Per night</dt>
                        <dd className="font-head text-xl text-ink">£{b.pricePerNight}</dd>
                      </div>
                    </dl>

                    <ul className="flex flex-wrap gap-1.5">
                      {b.features.map((f) => (
                        <li key={f} className="chip">
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center justify-end pt-2">
                      <span
                        className={`text-sm font-sub ${
                          b.available ? "text-rust group-hover:underline" : "text-ink/40"
                        }`}
                      >
                        {b.available ? "View profile →" : "Currently unavailable"}
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
