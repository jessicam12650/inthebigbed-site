import Link from "next/link";

const footerLinks = [
  { href: "/walkers", label: "Walkers" },
  { href: "/boarding", label: "Boarders & Daycare" },
  { href: "/groomers", label: "Groomers" },
  { href: "/vets", label: "Vets" },
  { href: "/places", label: "Dog-friendly places" },
  { href: "/lost", label: "Find my dog" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink px-5 py-14 md:px-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 font-head text-2xl tracking-tight text-cream">inthebigbed</div>
        <p className="mb-8 max-w-lg text-sm text-cream/55">
          Everything for dogs. And the people they allow in the bed.
        </p>
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-sub text-cream/50 transition-colors hover:text-cream"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-cream/40">
          <span>© {year} In The Big Bed Ltd. Liverpool.</span>
          <span>10% to Carla Lane Animals in Need</span>
        </div>
      </div>
    </footer>
  );
}
