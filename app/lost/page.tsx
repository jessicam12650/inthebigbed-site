"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type PhotoState =
  // No photo yet
  | { kind: "none" }
  // Pre-filled from the owner's most recent dog in public.dogs
  | { kind: "prefilled"; url: string }
  // User picked a new file in this session
  | { kind: "file"; file: File; preview: string };

export default function LostPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dogName, setDogName] = useState("");
  const [lastLocation, setLastLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<PhotoState>({ kind: "none" });

  /* Pre-fill the photo from the owner's most recent dog with a photo_url.
     Runs once on mount; the form stays fully usable for signed-out users. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (cancelled || !userData.user) return;

        const { data, error } = await supabase
          .from("dogs")
          .select("name, photo_url")
          .eq("user_id", userData.user.id)
          .not("photo_url", "is", null)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled || error) return;
        if (data?.photo_url) {
          setPhoto({ kind: "prefilled", url: data.photo_url });
          // If they haven't typed a name yet, nudge the most recent dog's name.
          setDogName((current) => current || (data.name as string) || "");
        }
      } catch {
        // Schema might not be applied yet — quietly skip.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleFileChange(file: File | null) {
    if (!file) {
      setPhoto({ kind: "none" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto({ kind: "file", file, preview: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function photoPreviewUrl(): string | null {
    if (photo.kind === "prefilled") return photo.url;
    if (photo.kind === "file") return photo.preview;
    return null;
  }

  async function uploadNewPhoto(file: File, reporterId: string | null): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const scope = reporterId ?? "anon";
    const path = `${scope}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("lost-dog-photos")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) return null;
    const { data } = supabase.storage.from("lost-dog-photos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const reporterId = userData.user?.id ?? null;

      let photoUrl: string | null = null;
      if (photo.kind === "file") {
        photoUrl = await uploadNewPhoto(photo.file, reporterId);
      } else if (photo.kind === "prefilled") {
        // Reuse the existing dog photo URL directly — no re-upload.
        photoUrl = photo.url;
      }

      const { error: insertErr } = await supabase.from("lost_dog_alerts").insert({
        reporter_id: reporterId,
        dog_name: dogName,
        last_location: lastLocation,
        phone,
        photo_url: photoUrl,
      });

      // Never fail loudly on a panicked form — log instead.
      if (insertErr) {
        console.error("lost_dog_alerts insert failed", insertErr);
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const previewUrl = photoPreviewUrl();

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
                <strong className="text-ink">{lastLocation || "your location"}</strong> has been notified.
                We'll text you the moment someone reports a sighting.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setDogName("");
                  setLastLocation("");
                  setPhone("");
                  setPhoto({ kind: "none" });
                }}
                className="btn-outline btn-block-mobile"
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
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
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
                  value={lastLocation}
                  onChange={(e) => setLastLocation(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 07700 900000"
                  className="field"
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-sub text-ink">Photo of your dog</span>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink/15 bg-cream/60">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Your dog" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl text-ink/40">🐾</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="btn-outline cursor-pointer justify-center text-xs">
                      {previewUrl ? "Change photo" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={() => setPhoto({ kind: "none" })}
                        className="text-xs font-sub text-ink/55 hover:text-ink"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink/50">
                  {photo.kind === "prefilled"
                    ? "Using your most recent dog profile photo. Upload a different one if this isn't the right dog."
                    : "Don't have a photo to hand? Submit without one — you can add it later."}
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
