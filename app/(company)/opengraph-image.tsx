import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/* The kit's lockup as a PNG. Satori draws an <img> reliably and the kit's
   SVG uses gradients and clip paths it may not, so the raster is the safe
   copy. Read at build time: this card is prerendered. */
const lockup = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/brand/eterneon-lockup-light.png"),
).toString("base64")}`;

export const alt = "Eterneon makes software for small businesses.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The company's share card, in the company page's colours and with its first
 * sentence. Sits beside the company page because a page that sets its own
 * openGraph replaces the image it would inherit. /muster keeps its own card.
 *
 * Satori, not a browser: flexbox only, and every element with more than one
 * child sets display:flex.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#e4e9e9",
          color: "#0f1516",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori, not the DOM */}
          <img src={lockup} width={192} height={44} alt="" />
        </div>

        <div style={{ fontSize: 76, lineHeight: 1.03, letterSpacing: "-0.03em", maxWidth: 980 }}>
          Eterneon makes software for small businesses.
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#4a5759" }}>
          Independent and California-owned.
        </div>
      </div>
    ),
    size,
  );
}
