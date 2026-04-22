"use client";

import { useMemo, useState } from "react";
import { GROOMERS } from "@/data/groomers";
import Rating from "@/components/Rating";
import PageHeader from "@/components/PageHeader";

const TYPE_FILTERS: Array<{ value: "all" | "salon" | "mobile"; label: string }> = [
  { value: "all", label: "Salon & mobile" },
  { value: "salon", label: "Salon only" },
  { value: "mobile", label: "Mobile only" },
];

export default function GroomersPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "salon" | "mobile">("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROOMERS.filter((g) => {
      if (type !== "all" && g.type !== type) return false;
      if (availableOnly && !g.available) return false;
      if (q) {
        const hay = `${g.name} ${g.area} ${g.bio} ${g.services.join(" ")} ${g.specialism.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, type, availableOnly]);

  return (
    <>
      <PageHeader
        eyebrow="Groomers & salons"
        title="Groomers in Liverpool."
        subtitle="Qualified groomers with City & Guilds or iPET Network accreditation. Salons and mobile grooming vans across the city."
      />

      <section className="border-b border-ink/10 bg-cream px-5 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, or specialism (e.g. doodles, nervous dogs)…"
            className="field flex-1"
            aria-label="Search groomers"
          />
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`rounded-sm border px-3 py-2 text-sm font-sub transition-colors ${
                  type === t.value
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 bg-white text-ink hover:border-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-sub text-ink">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded-sm border-ink accent-rust"
              />
              Taking bookings
            </label>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-sm text-ink/60">
            {filtered.length} {filtered.length === 1 ? "groomer" : "groomers"} found
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-sm border border-ink/10 bg-white p-10 text-center text-ink/60">
              No groomers match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((g) => (
                <article
                  key={g.id}
                  className="group flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-pop"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-head text-xl text-ink">{g.name}</h3>
                      <p className="mt-0.5 text-sm text-ink/60">
                        {g.type === "mobile" ? `Mobile · ${g.region ?? g.area}` : `${g.area} · ${g.distance}`}
                      </p>
                    </div>
                    <span
                      className={`tier-badge ${
                        g.type === "mobile" ? "border-sage text-sage bg-sage/5" : "border-rust text-rust bg-rust/5"
                      }`}
                    >
                      {g.type === "mobile" ? "🚐 Mobile" : "✂️ Salon"}
                    </span>
                  </header>

                  <div className="flex flex-wrap items-center gap-3">
                    <Rating rating={g.rating} reviews={g.reviews} />
                    <span className="chip">🎓 {g.qualification}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-ink/75">{g.bio}</p>

                  <div className="space-y-2">
                    <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Services</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {g.services.map((s) => (
                        <li key={s} className="chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Specialism</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {g.specialism.map((s) => (
                        <li key={s} className="chip border-rust/30 bg-rust/5 text-rust">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto flex items-end justify-between border-t border-ink/10 pt-4">
                    <div>
                      <div className="text-xs text-ink/55">From</div>
                      <div className="font-head text-2xl text-ink">£{g.priceFrom}</div>
                    </div>
                    <button
                      disabled={!g.available}
                      className={`btn-primary ${!g.available ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      {g.available ? "Book" : "Fully booked"}
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
