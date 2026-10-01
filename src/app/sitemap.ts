import type { MetadataRoute } from "next";
import { CHAIRS } from "@/data/chairs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/chairs`, priority: 0.9 },
    { url: `${SITE_URL}/fit`, priority: 0.8 },
    { url: `${SITE_URL}/fit/method`, priority: 0.5 },
    ...CHAIRS.map((chair) => ({ url: `${SITE_URL}/chairs/${chair.slug}`, priority: 0.7 })),
  ];
}
