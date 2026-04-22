import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section bg-cream">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-4 text-5xl">🐾</div>
        <h1 className="mb-3 font-head text-4xl text-ink md:text-5xl">Page not found.</h1>
        <p className="mb-8 text-base leading-relaxed text-ink/60">
          That link went chasing a squirrel. Let's get you back somewhere useful.
        </p>
        <div className="flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-dark btn-block-mobile">
            Back to home
          </Link>
          <Link href="/places" className="btn-outline btn-block-mobile">
            Dog-friendly places
          </Link>
        </div>
      </div>
    </section>
  );
}
