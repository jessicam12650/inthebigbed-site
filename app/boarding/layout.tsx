import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boarding & daycare in Liverpool",
  description:
    "Licensed dog boarders and daycare hosts across Liverpool. Licence numbers shown on every profile.",
};

export default function BoardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
