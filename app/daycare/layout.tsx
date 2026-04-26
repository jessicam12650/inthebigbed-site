import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog day care in Liverpool",
  description:
    "Licensed dog day care operators across Liverpool. Every day care holds a current licence from Liverpool City Council. Licence numbers shown on every profile.",
};

export default function DaycareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
