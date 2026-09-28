import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/* The kit's lockup as a PNG. Satori draws an <img> reliably and the kit's
   SVG uses gradients and clip paths it may not, so the raster is the safe
   copy. Read at build time: this card is prerendered. */
const lockup = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/brand/eterneon-lockup-dark.png"),
).toString("base64")}`;

/* Matches the H1 and the page title. It still said the old headline, so
   a shared link told a different story from the tab it opened in. When
   the headline changes, this file changes with it. */
export const alt = "Muster by Eterneon: AI advisors for small business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The renderer is Satori, not a browser. It supports flexbox and not
 * grid, and it does not clip absolutely positioned children with
 * overflow:hidden. Every container below sets display:flex explicitly,
 * because Satori requires it on any element with more than one child.
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
          backgroundColor: "#171a1c",
                    color: "#e7e8e9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori, not the DOM */}
          <img src={lockup} width={210} height={48} alt="" />
          <div
            style={{
              display: "flex",
              marginLeft: 10,
              padding: "7px 16px",
              borderRadius: 3,
              border: "1px solid #156d7f",
              backgroundColor: "rgba(21,109,127,0.35)",
              color: "#cff2f9",
              fontSize: 17,
              letterSpacing: "0.11em",
            }}
          >
            MUSTER · PRIVATE BETA
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 66,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              maxWidth: 940,
            }}
          >
            AI advisors for small business
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 27,
              lineHeight: 1.4,
              color: "#a2a8ac",
              maxWidth: 880,
            }}
          >
            Eight department heads: Marketing, Finance, Legal, Operations and four more, in one
            private workspace.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            paddingTop: 30,
            borderTop: "1px solid #2a2f33",
            fontSize: 24,
            color: "#a2a8ac",
          }}
        >
          <div style={{ display: "flex", color: "#62c6da" }}>
            Free for life for beta testers
          </div>
          <div style={{ display: "flex" }}>No credit card</div>
          <div style={{ display: "flex" }}>Bring your own API key</div>
        </div>
      </div>
    ),
    size,
  );
}
