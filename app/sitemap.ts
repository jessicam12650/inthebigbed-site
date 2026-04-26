import type { MetadataRoute } from "next";
import { WALKERS } from "@/data/walkers";
import { BOARDERS } from "@/data/boarders";
import { GROOMERS } from "@/data/groomers";
import { DAYCARES } from "@/data/daycares";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://inthebigbed.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const topRoutes = ["/", "/walkers", "/boarding", "/daycare", "/groomers", "/vets", "/places"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  const detailRoutes = [
    ...WALKERS.map((w) => `/walkers/${w.id}`),
    ...BOARDERS.map((b) => `/boarding/${b.id}`),
    ...GROOMERS.map((g) => `/groomers/${g.id}`),
    ...DAYCARES.map((d) => `/daycare/${d.id}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...topRoutes, ...detailRoutes];
}
