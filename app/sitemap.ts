import type { MetadataRoute } from "next";
import { gallery, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/gallery`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...gallery.map((section) => ({
      url: `${siteUrl}/gallery/${section.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
