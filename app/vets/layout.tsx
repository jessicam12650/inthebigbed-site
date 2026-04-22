import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vets & 24/7 emergency care in Liverpool",
  description:
    "Find a vet in Liverpool — 24-hour emergency care always at the top. Independent, chain and charity clinics.",
};

export default function VetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
