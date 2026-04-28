"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useUser } from "@/lib/useUser";

export type ProviderKind = "boarder" | "daycare" | "walker" | "groomer";

type Props = {
  providerKind: ProviderKind;
  providerId: string;
  providerName: string;
  claimed: boolean;
  onSubmitted?: (email: string) => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EnquiryForm({
  providerKind,
  providerId,
  providerName,
  claimed,
  onSubmitted,
}: Props) {
  const { user, loading } = useUser();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogSize, setDogSize] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setGuestEmail((prev) => prev || user.email || "");
    const metaName =
      (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || "";
    setGuestName((prev) => prev || metaName);
  }, [user]);

  function validate(): string | null {
    if (!guestName.trim()) return "Please enter your name.";
    if (!guestEmail.trim() || !EMAIL_RE.test(guestEmail.trim())) {
      return "Please enter a valid email address.";
    }
    if (!dogName.trim()) return "Please enter your dog's name.";
    if (!startDate) return "Please choose a start date.";
    if (!endDate) return "Please choose an end date.";
    if (endDate < startDate) return "End date must be on or after the start date.";
    return null;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_kind: providerKind,
          provider_id: providerId,
          provider_name: providerName,
          claimed,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: guestPhone.trim() || null,
          dog_name: dogName.trim(),
          dog_breed: dogBreed.trim() || null,
          dog_size: dogSize || null,
          start_date: startDate,
          end_date: endDate,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Couldn't send enquiry (${res.status}). Please try again.`);
        setSubmitting(false);
        return;
      }
      onSubmitted?.(guestEmail.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const labelCls = "mb-1 block text-xs font-sub uppercase tracking-wider text-cream/70";
  const inputCls =
    "w-full rounded-sm border border-cream/30 bg-ink px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-rust focus:outline-none";

  return (
    <form
      onSubmit={submit}
      className="w-full rounded-sm border border-cream/20 bg-cream/5 p-5 text-cream md:p-6"
    >
      {!loading && !user && (
        <p className="mb-4 text-sm text-cream/80">
          <Link href="/signup" className="underline hover:text-rust">
            Sign up
          </Link>{" "}
          to track your enquiries — or send as a guest below.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="enq-name" className={labelCls}>Your name</label>
          <input
            id="enq-name"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="enq-email" className={labelCls}>Your email</label>
          <input
            id="enq-email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="enq-phone" className={labelCls}>Your phone <span className="text-cream/50">(optional)</span></label>
          <input
            id="enq-phone"
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="enq-dogname" className={labelCls}>Dog&apos;s name</label>
          <input
            id="enq-dogname"
            type="text"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="enq-dogbreed" className={labelCls}>Dog&apos;s breed <span className="text-cream/50">(optional)</span></label>
          <input
            id="enq-dogbreed"
            type="text"
            value={dogBreed}
            onChange={(e) => setDogBreed(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="enq-dogsize" className={labelCls}>Dog&apos;s size <span className="text-cream/50">(optional)</span></label>
          <select
            id="enq-dogsize"
            value={dogSize}
            onChange={(e) => setDogSize(e.target.value)}
            className={inputCls}
          >
            <option value="">Select a size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label htmlFor="enq-start" className={labelCls}>Start date</label>
          <input
            id="enq-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="enq-end" className={labelCls}>End date</label>
          <input
            id="enq-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="enq-message" className={labelCls}>
          Message <span className="text-cream/50">(optional)</span>
        </label>
        <textarea
          id="enq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={`Anything ${providerName} should know about your dog?`}
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-sm border border-emergency/40 bg-emergency/20 px-3 py-2 text-sm text-cream">
          {error}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary px-6 py-3 text-base disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
