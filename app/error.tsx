"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-4 text-5xl">🐕‍🦺</div>
        <h1 className="mb-3 font-head text-4xl text-ink md:text-5xl">Something's off.</h1>
        <p className="mb-8 text-base leading-relaxed text-ink/60">
          We've logged it. Try again in a moment, or head back home while we sort this out.
        </p>
        <div className="flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn-primary btn-block-mobile">
            Try again
          </button>
          <Link href="/" className="btn-outline btn-block-mobile">
            Back to home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-ink/40">Ref: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
