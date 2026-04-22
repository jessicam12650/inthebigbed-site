"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { WALKERS } from "@/data/walkers";
import { BOARDERS } from "@/data/boarders";
import { GROOMERS } from "@/data/groomers";

type Kind = "walker" | "boarder" | "groomer";

type Row = {
  id: string;
  provider_kind: Kind;
  provider_id: string;
  message: string | null;
  status: string;
  created_at: string;
};

const KIND_LABEL: Record<Kind, string> = {
  walker: "Walk",
  boarder: "Boarding stay",
  groomer: "Groom",
};

const KIND_PATH: Record<Kind, string> = {
  walker: "/walkers",
  boarder: "/boarding",
  groomer: "/groomers",
};

function resolveProvider(kind: Kind, id: string): { name: string; area: string } | null {
  if (kind === "walker") {
    const w = WALKERS.find((x) => x.id === id);
    return w ? { name: w.name, area: w.area } : null;
  }
  if (kind === "boarder") {
    const b = BOARDERS.find((x) => x.id === id);
    return b ? { name: b.name, area: b.area } : null;
  }
  const g = GROOMERS.find((x) => x.id === id);
  return g ? { name: g.name, area: g.area } : null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookingRequests({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("id, provider_kind, provider_id, message, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setUnavailable(true);
      } else {
        setRows((data ?? []) as Row[]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function cancel(id: string) {
    if (!confirm("Cancel this booking request?")) return;
    setError(null);
    setCancelingId(id);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("booking_requests")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)) ?? prev);
    } finally {
      setCancelingId(null);
    }
  }

  if (unavailable) {
    // Schema not applied yet — keep the UI quiet rather than showing an error.
    return null;
  }

  return (
    <div className="mb-8 rounded-sm border border-ink/10 bg-white p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-head text-2xl text-ink">Your booking requests</h2>
        {rows && rows.length > 0 && (
          <span className="text-sm text-ink/55">
            {rows.length} {rows.length === 1 ? "request" : "requests"}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-emergency/30 bg-emergency/10 px-3 py-2 text-sm font-sub text-emergency">
          {error}
        </div>
      )}

      {rows === null ? (
        <div className="h-20 animate-pulse rounded-sm bg-cream/60" />
      ) : rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-ink/20 bg-cream/40 p-8 text-center">
          <div className="mb-2 text-3xl">📭</div>
          <p className="text-sm text-ink/60">
            You haven't requested a booking yet. Browse{" "}
            <Link href="/walkers" className="font-sub text-rust hover:opacity-80">
              walkers
            </Link>
            ,{" "}
            <Link href="/boarding" className="font-sub text-rust hover:opacity-80">
              boarders
            </Link>{" "}
            or{" "}
            <Link href="/groomers" className="font-sub text-rust hover:opacity-80">
              groomers
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const provider = resolveProvider(r.provider_kind, r.provider_id);
            const cancelled = r.status === "cancelled";
            return (
              <li
                key={r.id}
                className={`flex flex-col gap-3 rounded-sm border p-4 sm:flex-row sm:items-start sm:justify-between ${
                  cancelled ? "border-ink/10 bg-cream/30 opacity-70" : "border-ink/10 bg-cream/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-sub uppercase tracking-wider text-ink/50">
                      {KIND_LABEL[r.provider_kind]}
                    </span>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="mt-1 font-head text-lg text-ink">
                    {provider ? (
                      <Link
                        href={`${KIND_PATH[r.provider_kind]}/${r.provider_id}`}
                        className="hover:underline"
                      >
                        {provider.name}
                      </Link>
                    ) : (
                      <span className="text-ink/60">Unknown provider</span>
                    )}
                    {provider && <span className="ml-2 text-sm font-body text-ink/55">· {provider.area}</span>}
                  </div>
                  {r.message && (
                    <p className="mt-2 max-w-2xl truncate text-sm text-ink/65" title={r.message}>
                      “{r.message}”
                    </p>
                  )}
                  <div className="mt-1 text-xs text-ink/45">Sent {formatDate(r.created_at)}</div>
                </div>

                {!cancelled && (
                  <button
                    onClick={() => cancel(r.id)}
                    disabled={cancelingId === r.id}
                    className="shrink-0 self-start text-xs font-sub text-ink/55 hover:text-emergency disabled:opacity-50"
                  >
                    {cancelingId === r.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const style =
    status === "pending"
      ? "border-rust/30 bg-rust/10 text-rust"
      : status === "confirmed"
      ? "border-sage/30 bg-sage/10 text-sage"
      : status === "cancelled"
      ? "border-ink/15 bg-ink/5 text-ink/55"
      : "border-ink/15 bg-ink/5 text-ink/70";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`chip ${style}`}>{label}</span>;
}
