import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

const HERO_FEATURES = [
  { href: "/walkers", emoji: "🐾", title: "Verified Walkers", desc: "Find a DBS checked walker near you" },
  { href: "/boarding", emoji: "🏠", title: "Dog Boarding", desc: "Licensed boarders only" },
  { href: "/places", emoji: "📍", title: "Dog-friendly Places", desc: "Pubs, bars and cafes that love dogs" },
  { href: "#waitlist", emoji: "💼", title: "Join the waitlist", desc: "Be first when we launch" },
];

const FEATURES = [
  { emoji: "🐾", title: "Verified walkers", desc: "Every walker DBS checked, insured and rated", href: "/walkers" },
  { emoji: "🏠", title: "Doggy daycare", desc: "Licensed centres and vetted home sitters", href: "/boarding" },
  { emoji: "🛏", title: "Dog boarding", desc: "Trusted overnight stays with daily photo updates", href: "/boarding" },
  { emoji: "✂️", title: "Groomers", desc: "Salons and mobile groomers near you", href: "/groomers" },
  { emoji: "🏥", title: "Vets and healthcare", desc: "Find your nearest vet — emergency always at the top", href: "/vets" },
  { emoji: "🎓", title: "Dog trainers", desc: "Puppy classes, reactivity specialists, agility coaches" },
  { emoji: "📍", title: "Dog-friendly places", desc: "Pubs, cafes, parks and beaches that love dogs", href: "/places" },
  { emoji: "✈️", title: "UK getaways", desc: "Dog-friendly cottages, cabins and hotels across the UK" },
  { emoji: "👥", title: "Community", desc: "Meet Liverpool dog owners who truly get it" },
  { emoji: "💼", title: "Jobs board", desc: "Find work in the dog industry across Liverpool" },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-ink px-5 py-24 text-center md:px-12 md:py-32 md:text-left">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-7 font-head text-4xl leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            <span className="block text-cream">Everything for dogs.</span>
            <span className="block text-rust">And the people they allow in the bed.</span>
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-cream/60 md:mx-0 md:text-lg">
            Liverpool's dog platform — verified walkers, licensed daycares, groomers, vets, dog-friendly places,
            and a community of people who completely get it.
          </p>
          <Link href="#waitlist" className="btn-primary w-full px-7 py-3.5 text-base md:w-auto">
            Join the waitlist
          </Link>
          <p className="mt-4 text-xs text-cream/40">
            10% of every booking goes to Carla Lane Animals in Need 🐾
          </p>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {HERO_FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group flex flex-col gap-2 rounded-sm border border-cream/15 bg-cream/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cream/30 hover:bg-cream/[0.08]"
              >
                <span className="text-xl">{f.emoji}</span>
                <span className="text-[13px] font-sub text-cream">{f.title}</span>
                <span className="text-xs leading-snug text-cream/55">{f.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE ARE */}
      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 font-head text-3xl text-ink md:text-4xl">Everything in one place.</h2>
          <p className="mb-12 max-w-xl text-base leading-relaxed text-ink/60 md:text-[17px]">
            No more jumping between apps, googling vets, or hoping the stranger who walks your dog is actually
            qualified.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Inner = (
                <div className="flex h-full flex-col gap-2 rounded-sm border border-ink/10 bg-white p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-ink/30 group-hover:shadow-pop">
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-sub text-base text-ink">{f.title}</span>
                  <span className="text-sm leading-snug text-ink/60">{f.desc}</span>
                </div>
              );
              return f.href ? (
                <Link key={f.title} href={f.href} className="group block">
                  {Inner}
                </Link>
              ) : (
                <div key={f.title} className="group">
                  {Inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-ink px-5 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 font-head text-3xl text-cream md:text-4xl">
            Every walker verified. No exceptions.
          </h2>
          <p className="mb-12 text-base text-cream/55 md:text-[17px]">
            We don't just ask walkers to tick a box. We check.
          </p>
          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-sm border border-cream/20 p-6">
              <div className="mb-2 font-head text-xl text-cream">Silver</div>
              <div className="text-sm text-cream/60">Identity verified</div>
            </div>
            <div className="rounded-sm border border-rust p-6">
              <div className="mb-2 font-head text-xl text-rust">Gold</div>
              <div className="text-sm text-cream/60">DBS checked + pet first aid certified</div>
            </div>
            <div className="rounded-sm border border-cream/20 p-6">
              <div className="mb-2 font-head text-xl text-cream">Pro</div>
              <div className="text-sm text-cream/60">Fully insured + licensed</div>
            </div>
          </div>
        </div>
        <div className="-mx-5 bg-rust px-5 py-4 text-center font-sub text-ink md:-mx-12 md:px-12">
          No surge pricing. Ever. Fixed rates on bank holidays and Christmas.
        </div>
      </section>

      {/* CHARITY */}
      <section className="section bg-sage">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-5 font-head text-3xl text-cream md:text-4xl">10% of everything goes here.</h2>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-cream/95 md:text-[17px]">
            Every booking, every listing, every job posted — 10% goes directly to Carla Lane Animals in Need.
            Liverpool's beloved rescue sanctuary, rescuing and rehoming animals since 1988.
          </p>
          <a
            href="https://www.carlalaneanimalsinneed.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 inline-flex items-center rounded-sm border-2 border-cream bg-transparent px-5 py-2.5 text-sm font-sub text-cream transition-colors hover:bg-cream hover:text-sage"
          >
            carlalaneanimalsinneed.co.uk
          </a>
          <p className="text-xs text-cream/70">Registered charity no. 1031342</p>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 font-head text-4xl text-ink md:text-5xl">Be first in Liverpool.</h2>
          <p className="mb-10 max-w-xl text-base leading-relaxed text-ink/60 md:text-[17px]">
            Join the waitlist and get early access before we launch. No spam. Just your dog's new favourite app.
          </p>
          <WaitlistForm />
        </div>
      </section>
    </>
  );
}
