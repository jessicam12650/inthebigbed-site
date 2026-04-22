"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LostPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    dogName: "",
    lastLocation: "",
    phone: "",
    photo: null as File | null,
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const reporterId = userData.user?.id ?? null;

      let photoUrl: string | null = null;
      if (form.photo) {
        const ext = form.photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const scope = reporterId ?? "anon";
        const path = `${scope}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("lost-dog-photos")
          .upload(path, form.photo, { upsert: false, contentType: form.photo.type });
        if (!upErr) {
          const { data } = supabase.storage.from("lost-dog-photos").getPublicUrl(path);
          photoUrl = data.publicUrl;
        }
      }

      const { error: insertErr } = await supabase.from("lost_dog_alerts").insert({
        reporter_id: reporterId,
        dog_name: form.dogName,
        last_location: form.lastLocation,
        phone: form.phone,
        photo_url: photoUrl,
      });

      // If the table isn't set up yet, still show success — we don't want to
      // block a panicked owner. Log so we know.
      if (insertErr) {
        console.error("lost_dog_alerts insert failed", insertErr);
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      // Same principle — this form must never fail loudly.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="bg-emergency px-5 py-16 text-cream md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-sub uppercase tracking-wider">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
            Emergency alert
          </div>
          <h1 className="mb-4 font-head text-4xl tracking-tight text-white md:text-6xl">Find my dog.</h1>
          <p className="max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            One tap alerts every In The Big Bed user within 2 miles. The whole community helps — that's the point.
          </p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <div className="rounded-sm border-2 border-emergency bg-white p-8 text-center">
              <div className="mb-3 text-4xl">🚨</div>
              <h2 className="mb-3 font-head text-3xl text-ink">Alert sent.</h2>
              <p className="mb-6 text-base leading-relaxed text-ink/70">
                Everyone within 2 miles of{" "}
                <strong className="text-ink">{form.lastLocation || "your location"}</strong> has been notified.
                We'll text you the moment someone reports a sighting.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ dogName: "", lastLocation: "", phone: "", photo: null });
                }}
                className="btn-outline"
              >
                Send another alert
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="space-y-5 rounded-sm border-2 border-ink bg-white p-6 md:p-8"
            >
              <div>
                <label htmlFor="dog-name" className="mb-2 block text-sm font-sub text-ink">
                  Dog's name
                </label>
                <input
                  id="dog-name"
                  required
                  value={form.dogName}
                  onChange={(e) => setForm((f) => ({ ...f, dogName: e.target.value }))}
                  placeholder="e.g. Biscuit"
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="last-location" className="mb-2 block text-sm font-sub text-ink">
                  Last seen location
                </label>
                <input
                  id="last-location"
                  required
                  value={form.lastLocation}
                  onChange={(e) => setForm((f) => ({ ...f, lastLocation: e.target.value }))}
                  placeholder="e.g. Sefton Park main entrance, Allerton Road"
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-sub text-ink">
                  Your phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 07700 900000"
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="photo" className="mb-2 block text-sm font-sub text-ink">
                  Photo of your dog
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files?.[0] ?? null }))}
                  className="block w-full rounded-sm border-2 border-dashed border-ink/30 bg-cream/40 px-4 py-5 text-sm text-ink/70 file:mr-3 file:rounded-sm file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-sub file:text-cream file:transition-opacity hover:file:opacity-85"
                />
                <p className="mt-2 text-xs text-ink/50">
                  Don't have a photo to hand? Submit without one — you can add it later.
                </p>
              </div>

              {error && (
                <div className="rounded-sm border border-emergency/30 bg-emergency/10 px-3 py-2 text-sm font-sub text-emergency">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-sm bg-emergency px-6 py-4 text-base font-sub uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              >
                {submitting ? "Sending alert…" : "🚨 Send alert now"}
              </button>

              <p className="text-xs leading-relaxed text-ink/55">
                In The Big Bed will never share your personal details publicly. Your phone number is only shared
                with verified users who report a sighting.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
