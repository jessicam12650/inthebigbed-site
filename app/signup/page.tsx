"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const ROLES = [
  { value: "owner", label: "🐾 Dog owner" },
  { value: "walker", label: "🦮 Walker" },
  { value: "boarder", label: "🏠 Boarder" },
  { value: "groomer", label: "✂️ Groomer" },
] as const;

type Role = (typeof ROLES)[number]["value"];

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="section bg-cream">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-3 font-head text-3xl text-ink">Check your email</h1>
          <p className="mb-6 text-base leading-relaxed text-ink/70">
            We've sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to finish
            setting up your account.
          </p>
          <Link href="/login" className="btn-outline">
            Back to log in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-head text-4xl text-ink">Create your account</h1>
          <p className="text-sm text-ink/60">Join Liverpool's dog community. Free to sign up.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 rounded-sm border border-ink/15 bg-white p-6 md:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="first-name" className="mb-2 block text-sm font-sub text-ink">
                First name
              </label>
              <input
                id="first-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jessica"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="mb-2 block text-sm font-sub text-ink">
                Last name
              </label>
              <input
                id="last-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="field"
              />
            </div>
          </div>

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

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-sub text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-sub text-ink">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="field"
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-sub text-ink">I am joining as</legend>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center justify-center rounded-sm border-2 px-3 py-3 text-sm font-sub transition-colors ${
                    role === r.value
                      ? "border-rust bg-rust/10 text-ink"
                      : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="sr-only"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <div className="rounded-sm border border-emergency/30 bg-emergency/10 px-3 py-2 text-sm font-sub text-emergency">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-dark w-full py-3 text-base disabled:opacity-60">
            {loading ? "Creating account…" : "Create my account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-sub text-rust hover:opacity-80">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
