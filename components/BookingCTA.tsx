"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ProviderKind = "walker" | "boarder" | "groomer";

const SIGNUP_PARAM: Record<ProviderKind, string> = {
  walker: "walker",
  boarder: "boarder",
  groomer: "groomer",
};

export default function BookingCTA({
  kind,
  id,
  available,
  label,
  unavailableLabel = "Join the waitlist",
}: {
  kind: ProviderKind;
  id: string;
  available: boolean;
  label: string;
  unavailableLabel?: string;
}) {
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setChecked(true);
    });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_kind: kind, provider_id: id, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Request failed (${res.status})`);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Don't flash the wrong CTA before we know auth state.
  if (!checked) {
    return <span className="btn-primary cursor-wait px-6 py-3 text-base opacity-50">{label}</span>;
  }

  // Logged-out flow unchanged — capture the intent on the signup page.
  if (!signedIn) {
    return (
      <Link
        href={`/signup?role=owner&${SIGNUP_PARAM[kind]}=${id}`}
        className="btn-primary px-6 py-3 text-base"
      >
        {available ? label : unavailableLabel}
      </Link>
    );
  }

  if (sent) {
    return (
      <div className="rounded-sm border-2 border-sage bg-sage/10 px-4 py-3 text-sm font-sub text-ink">
        ✅ Request sent. We'll notify you when they respond.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary px-6 py-3 text-base"
        disabled={!available}
      >
        {available ? label : unavailableLabel}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md rounded-sm border border-cream/20 bg-cream/10 p-4 text-left text-cream"
    >
      <label htmlFor="booking-message" className="mb-2 block text-xs font-sub uppercase tracking-wider text-cream/60">
        Anything {kind === "boarder" ? "they" : "they"} should know?
      </label>
      <textarea
        id="booking-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder={
          kind === "walker"
            ? "Dates, preferred time, your dog's temperament…"
            : kind === "boarder"
            ? "Arrival + return dates, number of dogs…"
            : "Breed, coat length, preferred date…"
        }
        className="w-full resize-none rounded-sm border border-cream/30 bg-ink px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-rust focus:outline-none"
      />
      {error && (
        <div className="mt-2 rounded-sm border border-emergency/40 bg-emergency/20 px-3 py-2 text-sm text-cream">
          {error}
        </div>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-sm px-3 py-2 text-sm font-sub text-cream/70 hover:text-cream"
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
          {submitting ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
