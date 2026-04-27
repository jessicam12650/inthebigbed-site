"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { WALKERS } from "@/data/walkers";
import { BOARDERS } from "@/data/boarders";
import { GROOMERS } from "@/data/groomers";

const ROLES = [
  { value: "owner", label: "🐾 Dog owner" },
  { value: "walker", label: "🦮 Walker" },
  { value: "boarder", label: "🏠 Boarder" },
  { value: "groomer", label: "✂️ Groomer" },
] as const;

type Role = (typeof ROLES)[number]["value"];

const VALID_ROLES = new Set<Role>(["owner", "walker", "boarder", "groomer"]);

function isRole(value: string | null): value is Role {
  return value !== null && VALID_ROLES.has(value as Role);
}

function findIntent(searchParams: URLSearchParams) {
  const walkerId = searchParams.get("walker");
  if (walkerId) {
    const w = WALKERS.find((x) => x.id === walkerId);
    if (w) return { kind: "walker" as const, name: w.name, area: w.area, returnTo: `/walkers/${w.id}` };
  }
  const boarderId = searchParams.get("boarder");
  if (boarderId) {
    const b = BOARDERS.find((x) => x.id === boarderId);
    if (b) return { kind: "boarder" as const, name: b.name, area: b.area, returnTo: `/boarding/${b.id}` };
  }
  const groomerId = searchParams.get("groomer");
  if (groomerId) {
    const g = GROOMERS.find((x) => x.id === groomerId);
    if (g) return { kind: "groomer" as const, name: g.name, area: g.area, returnTo: `/groomers/${g.id}` };
  }
  return null;
}

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();

  const intent = useMemo(() => findIntent(searchParams), [searchParams]);
  const initialRole: Role = isRole(searchParams.get("role")) ? (searchParams.get("role") as Role) : "owner";

  // Bounce already-signed-in visitors to the intent target or /profile.
  // Replaces the Edge-runtime middleware redirect we just removed.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(intent?.returnTo ?? "/profile");
    }
  }, [authLoading, user, intent, router]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>(initialRole);
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
            intent: intent ? { kind: intent.kind, return_to: intent.returnTo } : null,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?type=signup&next=${encodeURIComponent(intent?.returnTo ?? "/profile")}`
              : undefined,
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
      <div className="rounded-sm border border-sage bg-sage/10 p-8 text-center">
        <div className="mb-3 text-4xl">📬</div>
        <h2 className="mb-3 font-head text-3xl text-ink">Check your email</h2>
        <p className="mb-6 text-base leading-relaxed text-ink/70">
          We've sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to finish
          setting up your account
          {intent ? (
            <>
              {" "}
              and head back to <strong className="text-ink">{intent.name}</strong>.
            </>
          ) : (
            "."
          )}
        </p>
        <Link href="/login" className="btn-outline btn-block-mobile">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <>
      {intent && (
        <div className="mb-5 rounded-sm border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-ink">
          You're signing up to {intent.kind === "walker" ? "book a walk with" : intent.kind === "boarder" ? "book a stay with" : "book a groom with"}{" "}
          <strong className="font-sub">{intent.name}</strong> ({intent.area}). We'll take you back to their
          profile after you confirm your email.
        </div>
      )}

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
    </>
  );
}
