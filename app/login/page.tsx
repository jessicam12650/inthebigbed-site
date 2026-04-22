import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-head text-4xl text-ink">Welcome back 🐾</h1>
          <p className="text-sm text-ink/60">Log in to your In The Big Bed account.</p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-sm border border-ink/10 bg-white" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don't have an account?{" "}
          <Link href="/signup" className="font-sub text-rust hover:opacity-80">
            Sign up free
          </Link>
        </p>
      </div>
    </section>
  );
}
