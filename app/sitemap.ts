import type { MetadataRoute } from "next";
import { contentUpdated, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: contentUpdated.home,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: contentUpdated.privacy,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: contentUpdated.terms,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
