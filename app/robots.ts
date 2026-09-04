import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Two different kinds of crawler, treated differently.
 *
 * Training crawlers take the page into a model. Search crawlers fetch it
 * to answer somebody who is asking about us, so blocking those would
 * remove Eterneon from AI search results rather than protect anything.
 *
 * None of this is enforcement. robots.txt is a convention that stops
 * nothing which does not identify itself.
 */
const trainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...trainingCrawlers.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
