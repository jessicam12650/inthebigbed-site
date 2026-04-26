"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import BookingRequests from "@/components/BookingRequests";
import { convertHeicIfNeeded } from "@/lib/imageConvert";

type DogRow = {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  age: string | null;
  size: string | null;
  notes: string | null;
  photo_url: string | null;
};

type Dog = {
  id: string;
  name: string;
  breed: string;
  age: string;
  size: string;
  notes: string;
  photo_url?: string | null;
  photoPreview?: string | null;
  photoFile?: File | null;
};

const SIZE_OPTIONS = [
  "Small (under 10kg)",
  "Medium (10–25kg)",
  "Large (25–40kg)",
  "Giant (over 40kg)",
];

const BLANK_DOG: Omit<Dog, "id"> = {
  name: "",
  breed: "",
  age: "",
  size: "",
  notes: "",
  photo_url: null,
  photoPreview: null,
  photoFile: null,
};

function rowToDog(row: DogRow): Dog {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed ?? "",
    age: row.age ?? "",
    size: row.size ?? "",
    notes: row.notes ?? "",
    photo_url: row.photo_url,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [editing, setEditing] = useState<Dog | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // True when Supabase `dogs` table is missing — falls back to localStorage so
  // the dashboard still works in dev before the schema is applied.
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        router.replace("/login?next=/profile");
        return;
      }
      setUser(data.user);

      const { data: rows, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        // Missing table / RLS / bucket — fall back to localStorage.
        setFallbackMode(true);
        try {
          const raw = localStorage.getItem(`itbb_dogs_${data.user.id}`);
          if (raw) setDogs(JSON.parse(raw));
        } catch {}
      } else if (rows) {
        setDogs(rows.map(rowToDog));
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!user || !fallbackMode) return;
    try {
      localStorage.setItem(`itbb_dogs_${user.id}`, JSON.stringify(dogs));
    } catch {}
  }, [dogs, user, fallbackMode]);

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function startNewDog() {
    setError(null);
    setEditing({ id: crypto.randomUUID(), ...BLANK_DOG });
  }

  async function uploadPhotoIfNeeded(dog: Dog): Promise<string | null> {
    if (!dog.photoFile || !user) return dog.photo_url ?? null;
    if (fallbackMode) return dog.photoPreview ?? dog.photo_url ?? null;
    const supabase = getSupabaseBrowserClient();
    const ext = dog.photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${dog.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("dog-photos")
      .upload(path, dog.photoFile, { upsert: true, contentType: dog.photoFile.type });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("dog-photos").getPublicUrl(path);
    return `${data.publicUrl}?v=${Date.now()}`;
  }

  async function saveDog(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing || !user) return;
    setError(null);
    setSaving(true);
    try {
      const photo_url = await uploadPhotoIfNeeded(editing);
      const payload = {
        id: editing.id,
        user_id: user.id,
        name: editing.name,
        breed: editing.breed,
        age: editing.age,
        size: editing.size,
        notes: editing.notes,
        photo_url,
      };

      if (!fallbackMode) {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.from("dogs").upsert(payload);
        if (error) throw error;
      }

      setDogs((prev) => {
        const next: Dog = {
          id: editing.id,
          name: editing.name,
          breed: editing.breed,
          age: editing.age,
          size: editing.size,
          notes: editing.notes,
          photo_url: fallbackMode ? editing.photoPreview ?? editing.photo_url ?? null : photo_url,
        };
        const exists = prev.find((d) => d.id === editing.id);
        return exists ? prev.map((d) => (d.id === editing.id ? next : d)) : [...prev, next];
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save dog");
    } finally {
      setSaving(false);
    }
  }

  async function removeDog(id: string) {
    if (!user) return;
    if (!confirm("Remove this dog profile?")) return;
    if (!fallbackMode) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("dogs").delete().eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
    }
    setDogs((prev) => prev.filter((d) => d.id !== id));
  }

  async function onPhotoChange(file: File | null) {
    if (!editing) return;
    if (!file) {
      setEditing({ ...editing, photoFile: null, photoPreview: null, photo_url: null });
      return;
    }
    const converted = await convertHeicIfNeeded(file);
    const reader = new FileReader();
    reader.onload = () =>
      setEditing((e) =>
        e ? { ...e, photoFile: converted, photoPreview: reader.result as string } : e,
      );
    reader.readAsDataURL(converted);
  }

  if (loading) {
    return (
      <section className="section bg-cream">
        <div className="mx-auto max-w-2xl text-center text-ink/60">Loading your profile…</div>
      </section>
    );
  }

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? "";
  const lastName = (user?.user_metadata?.last_name as string | undefined) ?? "";
  const role = (user?.user_metadata?.role as string | undefined) ?? "owner";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0];

  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-3xl">
        {/* ACCOUNT */}
        <div className="mb-8 rounded-sm border border-ink/10 bg-white p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-sub uppercase tracking-wider text-rust">Your account</div>
              <h1 className="mt-1 font-head text-3xl text-ink md:text-4xl">Hi, {fullName} 🐾</h1>
              <p className="mt-1 text-sm text-ink/60">
                {user?.email} · Signed in as{" "}
                <span className="font-sub text-ink">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </p>
            </div>
            <button onClick={logout} className="btn-outline btn-block-mobile text-sm">
              Log out
            </button>
          </div>
          {fallbackMode && (
            <div className="mt-5 rounded-sm border border-rust/30 bg-rust/10 px-3 py-2 text-xs text-rust">
              Dev note: the <code className="font-sub">dogs</code> table isn't set up in Supabase yet — your dog
              profiles are saved to this browser only. Apply{" "}
              <code className="font-sub">supabase/schema.sql</code> to enable cloud sync.
            </div>
          )}
        </div>

        {/* DOGS */}
        {role === "owner" && (
          <div className="mb-8 rounded-sm border border-ink/10 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-head text-2xl text-ink">Your dogs</h2>
              {!editing && (
                <button onClick={startNewDog} className="btn-primary text-sm">
                  + Add a dog
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={saveDog} className="space-y-5">
                <div className="flex flex-col items-start gap-5 sm:flex-row">
                  <div className="flex w-full flex-col items-center gap-3 sm:w-44">
                    <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-ink/15 bg-cream/60">
                      {(editing.photoPreview || editing.photo_url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editing.photoPreview || editing.photo_url || ""}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-ink/40">🐾</span>
                      )}
                    </div>
                    <label
                      className={`btn-outline w-full cursor-pointer justify-center text-xs ${
                        saving ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      {editing.photoPreview || editing.photo_url ? "Change photo" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                        disabled={saving}
                      />
                    </label>
                    {(editing.photoPreview || editing.photo_url) && (
                      <button
                        type="button"
                        onClick={() => onPhotoChange(null)}
                        disabled={saving}
                        className="text-xs font-sub text-ink/55 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-ink/55"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>

                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-sub text-ink">Dog's name</label>
                      <input
                        required
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        placeholder="e.g. Biscuit"
                        className="field"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-sub text-ink">Breed</label>
                      <input
                        value={editing.breed}
                        onChange={(e) => setEditing({ ...editing, breed: e.target.value })}
                        placeholder="e.g. Labrador"
                        className="field"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-sub text-ink">Age</label>
                      <input
                        value={editing.age}
                        onChange={(e) => setEditing({ ...editing, age: e.target.value })}
                        placeholder="e.g. 3 years"
                        className="field"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-sub text-ink">Size</label>
                      <select
                        value={editing.size}
                        onChange={(e) => setEditing({ ...editing, size: e.target.value })}
                        className="field"
                      >
                        <option value="">Select size</option>
                        {SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-sub text-ink">
                        Medical notes or special requirements
                      </label>
                      <textarea
                        value={editing.notes}
                        onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                        rows={3}
                        placeholder="e.g. Allergic to chicken, nervous around other dogs, takes daily medication…"
                        className="field"
                      />
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="rounded-sm border border-emergency/30 bg-emergency/10 px-3 py-2 text-sm font-sub text-emergency">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving…" : "Save dog"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setError(null);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : dogs.length === 0 ? (
              <div className="rounded-sm border border-dashed border-ink/20 bg-cream/40 p-8 text-center">
                <div className="mb-2 text-3xl">🐾</div>
                <p className="text-sm text-ink/60">No dogs added yet. Add your first pup to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {dogs.map((d) => (
                  <article key={d.id} className="flex gap-4 rounded-sm border border-ink/10 bg-cream/40 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-white">
                      {d.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.photo_url} alt={d.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-ink/40">
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-head text-lg text-ink">{d.name}</h3>
                      <p className="text-sm text-ink/60">
                        {[d.breed, d.age, d.size].filter(Boolean).join(" · ")}
                      </p>
                      {d.notes && <p className="mt-1 truncate text-xs text-ink/50">{d.notes}</p>}
                      <div className="mt-3 flex gap-3 text-xs font-sub">
                        <button onClick={() => setEditing(d)} className="text-rust hover:opacity-80">
                          Edit
                        </button>
                        <button onClick={() => removeDog(d.id)} className="text-ink/50 hover:text-emergency">
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKING REQUESTS */}
        {role === "owner" && user && <BookingRequests userId={user.id} />}

        {/* QUICK LINKS */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 md:p-8">
          <h2 className="mb-4 font-head text-2xl text-ink">Quick links</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link href="/walkers" className="rounded-sm border border-ink/10 bg-cream/40 p-4 text-center text-sm font-sub text-ink transition-colors hover:border-ink/30">
              🐾 Walkers
            </Link>
            <Link href="/boarding" className="rounded-sm border border-ink/10 bg-cream/40 p-4 text-center text-sm font-sub text-ink transition-colors hover:border-ink/30">
              🏠 Boarding
            </Link>
            <Link href="/groomers" className="rounded-sm border border-ink/10 bg-cream/40 p-4 text-center text-sm font-sub text-ink transition-colors hover:border-ink/30">
              ✂️ Groomers
            </Link>
            <Link href="/vets" className="rounded-sm border border-ink/10 bg-cream/40 p-4 text-center text-sm font-sub text-ink transition-colors hover:border-ink/30">
              🏥 Vets
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
