import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/* Crawlers that collect pages to train models on. All of these publish a
 * user-agent and honour robots.txt - which is exactly why listing them works
 * and why it does nothing about scrapers that do not identify themselves.
 *
 * Deliberately not listed: OAI-SearchBot, Claude-SearchBot, ChatGPT-User and
 * Claude-User. Those fetch a page to answer someone who asked about you, so
 * blocking them takes the site out of AI search results rather than out of
 * training sets.
 */
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
