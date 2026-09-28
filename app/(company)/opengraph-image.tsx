import { ImageResponse } from "next/og";

export const alt = "Eterneon: software a small business can run on";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The company's share card, in the company page's light, rounded look.
 * Sits beside the company page because a page that sets its own openGraph
 * replaces the image it would inherit. /muster keeps its own dark card.
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
          padding: 48,
          backgroundColor: "#f4f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            borderRadius: 40,
            backgroundColor: "#ffffff",
            border: "1px solid #e3e5e9",
            color: "#101217",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
              <path fill="#101217" fillRule="evenodd" d="M0 0H100V100H30L0 70Z M12 12H88V88H35L12 65Z" />
              <rect x="27" y="25" width="10" height="36" fill="#101217" />
              <rect x="45" y="25" width="10" height="36" fill="#5a45ff" />
              <rect x="63" y="25" width="10" height="36" fill="#101217" />
              <rect x="27" y="65" width="46" height="10" fill="#101217" />
            </svg>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              Eterneon
            </div>
          </div>

          <div style={{ fontSize: 72, lineHeight: 1.04, letterSpacing: "-0.035em", maxWidth: 900 }}>
            Software a small business can run on.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#545a66" }}>
            <div
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 999,
                backgroundColor: "#efecff",
                color: "#3b2bd6",
              }}
            >
              Home of Muster
            </div>
            <div style={{ display: "flex" }}>Made in California</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
