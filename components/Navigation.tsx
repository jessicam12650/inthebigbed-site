"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/walkers", label: "Walkers" },
  { href: "/boarding", label: "Boarding" },
  { href: "/daycare", label: "Day care" },
  { href: "/groomers", label: "Groomers" },
  { href: "/vets", label: "Vets" },
  { href: "/places", label: "Dog-friendly places" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  // Close the drawer on route change so navigating from the mobile menu
  // doesn't leave the overlay stuck open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="sticky top-0 z-50 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-12">
        <Link
          href="/"
          onClick={close}
          className="font-head text-[22px] tracking-tight text-ink md:text-2xl"
        >
          inthebigbed
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-sub transition-opacity hover:opacity-60 ${
                  active ? "text-rust" : "text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="text-sm font-body text-ink transition-opacity hover:opacity-60"
          >
            Log in
          </Link>
          <Link href="/signup" className="btn-dark px-4 py-2 text-sm">
            Sign up
          </Link>
          <Link href="/lost" className="btn-emergency px-4 py-2 text-sm">
            Find my dog
          </Link>
        </div>

        {/* Mobile toggle — 48x48 tap target with 24px bars */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="-mr-2 flex h-12 w-12 flex-col items-center justify-center gap-[6px] rounded-sm lg:hidden"
        >
          <span
            className={`h-[3px] w-6 rounded-full bg-ink transition-transform ${
              open ? "translate-y-[9px] rotate-45" : ""
            }`}
          />
          <span className={`h-[3px] w-6 rounded-full bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-[3px] w-6 rounded-full bg-ink transition-transform ${
              open ? "-translate-y-[9px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer — 48px rows for easy tapping */}
      {open && (
        <div className="border-t border-ink/10 bg-cream px-5 py-3 lg:hidden">
          <div className="flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="flex min-h-[48px] items-center text-base font-sub text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-ink/10" />
            <Link
              href="/login"
              onClick={close}
              className="flex min-h-[48px] items-center text-base font-body text-ink"
            >
              Log in
            </Link>
            <div className="flex flex-col gap-3 pb-1 pt-3">
              <Link href="/signup" onClick={close} className="btn-dark w-full">
                Sign up
              </Link>
              <Link href="/lost" onClick={close} className="btn-emergency w-full">
                Find my dog
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
