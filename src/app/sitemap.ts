import type { MetadataRoute } from "next";

import { getAllFieldNotes } from "@/lib/notes";

function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const routes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/systems`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${origin}/systems/project-wifi`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${origin}/lab`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${origin}/signals`, changeFrequency: "daily", priority: 0.75 },
    { url: `${origin}/field-notes`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/about`, changeFrequency: "yearly", priority: 0.6 },
  ];

  return [
    ...routes,
    ...getAllFieldNotes().map((note) => ({
      url: `${origin}/field-notes/${note.slug}`,
      lastModified: note.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.65,
    })),
  ];
}
