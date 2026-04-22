"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
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
        {sent ? (
          <div className="rounded-sm border border-sage bg-sage/10 p-8 text-center">
            <div className="mb-3 text-4xl">📬</div>
            <h1 className="mb-3 font-head text-3xl text-ink">Check your email</h1>
            <p className="mb-6 text-base leading-relaxed text-ink/70">
              If an account exists for <strong className="text-ink">{email}</strong>, we've sent a link to reset
              your password.
            </p>
            <Link href="/login" className="btn-outline btn-block-mobile">
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-head text-4xl text-ink">Reset password</h1>
              <p className="text-sm text-ink/60">
                Enter your email and we'll send you a link to choose a new one.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-5 rounded-sm border border-ink/15 bg-white p-6 md:p-8"
            >
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-sub text-ink">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jessica@example.com"
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
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
              Remembered it?{" "}
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
