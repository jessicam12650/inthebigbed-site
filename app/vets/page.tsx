"use client";

import { useMemo, useState } from "react";
import { VETS, type VetType, type Vet } from "@/data/vets";
import Rating from "@/components/Rating";
import PageHeader from "@/components/PageHeader";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";

const TYPE_FILTERS: Array<{ value: "all" | VetType; label: string }> = [
  { value: "all", label: "All vets" },
  { value: "independent", label: "Independent" },
  { value: "chain", label: "Chain" },
  { value: "pdsa", label: "Charity / PDSA" },
];

function formatPhone(raw: string) {
  const s = raw.replace(/\D/g, "");
  if (s.length === 11) return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
  return raw;
}

function VetCard({ vet }: { vet: Vet }) {
  return (
    <article className="group flex flex-col gap-4 rounded-sm border border-ink/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-pop">
      <header>
        <h3 className="font-head text-xl text-ink">{vet.name}</h3>
        <p className="mt-0.5 text-sm text-ink/60">{vet.address}</p>
      </header>

      {(vet.rating != null || vet.hours) && (
        <div className="flex flex-wrap items-center gap-3">
          {vet.rating != null && <Rating rating={vet.rating} reviews={vet.reviews} />}
          {vet.hours && <span className="chip">🕒 {vet.hours}</span>}
        </div>
      )}

      {vet.tags && (
        <ul className="flex flex-wrap gap-1.5">
          {vet.tags.map((t) => (
            <li key={t} className="chip border-sage/30 bg-sage/10 text-sage">
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <div className="text-xs font-sub uppercase tracking-wider text-ink/50">Services</div>
        <ul className="flex flex-wrap gap-1.5">
          {vet.services.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
        <a href={`tel:${vet.phone}`} className="btn-dark flex-1 justify-center">
          Call {formatPhone(vet.phone)}
        </a>
        {vet.website && (
          <a
            href={vet.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline whitespace-nowrap"
          >
            Website
          </a>
        )}
      </div>
    </article>
  );
}

export default function VetsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | VetType>("all");

  const emergency = VETS.find((v) => v.isEmergency);
  const regular = VETS.filter((v) => !v.isEmergency);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regular.filter((v) => {
      if (type !== "all" && v.type !== type) return false;
      if (q) {
        const hay = `${v.name} ${v.area} ${v.address} ${v.services.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, type, regular]);

  return (
    <>
      <PageHeader
        eyebrow="Liverpool vets"
        title="Vets & emergency care."
        subtitle="24-hour emergency care is always pinned to the top. Below: every vet across Liverpool — independent, chain and charity."
      />

      {/* EMERGENCY — always on top */}
      {emergency && (
        <section className="bg-emergency px-5 py-10 md:px-12 md:py-14">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-sub uppercase tracking-wider text-white/80">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
              24/7 Emergency — open right now
            </div>
            <div className="rounded-sm border-2 border-white bg-white p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-head text-2xl text-ink md:text-3xl">{emergency.name}</h2>
                  <p className="mt-1 text-sm text-ink/70">{emergency.address}</p>
                  {emergency.bio && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/75">{emergency.bio}</p>
                  )}
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {emergency.services.map((s) => (
                      <li key={s} className="chip border-emergency/30 bg-emergency/10 text-emergency">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`tel:${emergency.phone}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-sm bg-emergency px-6 py-4 text-base font-sub text-white transition-opacity hover:opacity-90"
                >
                  Call now · {formatPhone(emergency.phone)}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FILTERS */}
      <section className="border-b border-ink/10 bg-cream px-5 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, or service…"
            className="field flex-1"
            aria-label="Search vets"
          />
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((t) => (
              <FilterChip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
                {t.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-sm text-ink/60">
            {filtered.length} {filtered.length === 1 ? "vet" : "vets"} found
          </div>
          {filtered.length === 0 ? (
            <EmptyState>No vets match your filters.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((v) => (
                <VetCard key={v.id} vet={v} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
