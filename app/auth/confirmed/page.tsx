import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email confirmed",
  description: "Your In The Big Bed email is verified.",
  robots: { index: false, follow: false },
};

export default function ConfirmedPage() {
  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-md">
        <div className="rounded-sm border border-sage bg-sage/10 p-8 text-center">
          <h1 className="mb-3 font-head text-4xl text-ink">Email confirmed 🎉</h1>
          <p className="mb-6 text-base leading-relaxed text-ink/70">
            Welcome to In The Big Bed! Your email is verified and you're ready to log in.
          </p>
          <Link href="/login" className="btn-dark btn-block-mobile">
            Log in
          </Link>
          <p className="mt-6 text-sm text-ink/60">
            <Link href="/" className="font-sub text-rust hover:opacity-80">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
