"use client";

import { useMemo, useState } from "react";
import { WALKERS, type Tier } from "@/data/walkers";
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

export default function WalkersPage() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | Tier>("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WALKERS.filter((w) => {
      if (tier !== "all" && w.tier !== tier) return false;
      if (availableOnly && !w.available) return false;
      if (q) {
        const hay = `${w.name} ${w.area} ${w.bio} ${w.features.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, tier, availableOnly]);

  return (
    <>
      <PageHeader
        eyebrow="Verified walkers"
        title="Dog walkers in Liverpool."
        subtitle="Every walker on In The Big Bed is verified. Identity checked at minimum — DBS, first aid, and insurance on Gold and Pro tiers."
      />

      {/* FILTERS */}
      <section className="border-b border-ink/10 bg-cream px-5 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, or specialism…"
            className="field flex-1"
            aria-label="Search walkers"
          />
          <div className="flex flex-wrap items-center gap-2">
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

      {/* RESULTS */}
      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-sm text-ink/60">
            {filtered.length} {filtered.length === 1 ? "walker" : "walkers"} found
          </div>
          {filtered.length === 0 ? (
            <EmptyState>No walkers match your filters. Try broadening your search.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((w) => (
                <article
                  key={w.id}
                  className="group flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-pop"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-head text-xl text-ink">{w.name}</h3>
                      <p className="mt-0.5 text-sm text-ink/60">
                        {w.area} · {w.distance}
                      </p>
                    </div>
                    <TierBadge tier={w.tier} />
                  </header>

                  <Rating rating={w.rating} reviews={w.reviews} />

                  <p className="text-sm leading-relaxed text-ink/75">{w.bio}</p>

                  <ul className="flex flex-wrap gap-1.5">
                    {w.features.map((f) => (
                      <li key={f} className="chip">
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between border-t border-ink/10 pt-4">
                    <div>
                      <div className="font-head text-2xl text-ink">£{w.pricePerWalk}</div>
                      <div className="text-xs text-ink/55">
                        per walk · {w.durationOptions.join(" / ")} · up to {w.maxDogs} dogs
                      </div>
                    </div>
                    <button
                      disabled={!w.available}
                      className={`btn-primary ${!w.available ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      {w.available ? "Book" : "Full"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
