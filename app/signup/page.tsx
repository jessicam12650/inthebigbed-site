import { Suspense } from "react";
import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-head text-4xl text-ink">Create your account</h1>
          <p className="text-sm text-ink/60">Join Liverpool's dog community. Free to sign up.</p>
        </div>

        <Suspense fallback={<div className="h-[640px] animate-pulse rounded-sm border border-ink/10 bg-white" />}>
          <SignupForm />
        </Suspense>

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
