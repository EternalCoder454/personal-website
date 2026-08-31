import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/* Training crawlers only. AI search bots stay allowed: blocking those drops
   the site from AI search results, not from training sets. */
const TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "FacebookBot",
  "Diffbot",
  "omgilibot",
  "cohere-ai",
  "ImagesiftBot",
  "Timpibot",
  "PerplexityBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: TRAINING_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
