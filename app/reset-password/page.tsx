"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setDone(true);
        setTimeout(() => router.push("/profile"), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-md">
        {done ? (
          <div className="rounded-sm border border-sage bg-sage/10 p-8 text-center">
            <div className="mb-3 text-4xl">✅</div>
            <h1 className="mb-3 font-head text-3xl text-ink">Password updated</h1>
            <p className="text-base text-ink/70">Redirecting you to your profile…</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-head text-4xl text-ink">Choose a new password</h1>
              <p className="text-sm text-ink/60">At least 8 characters.</p>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-5 rounded-sm border border-ink/15 bg-white p-6 md:p-8"
            >
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-sub text-ink">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-sub text-ink">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="field"
                />
              </div>

              {error && (
                <div className="rounded-sm border border-emergency/30 bg-emergency/10 px-3 py-2 text-sm font-sub text-emergency">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-dark w-full py-3 text-base disabled:opacity-60"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
              <Link href="/login" className="font-sub text-rust hover:opacity-80">
                Back to log in
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
