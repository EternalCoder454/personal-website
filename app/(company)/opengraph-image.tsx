import { ImageResponse } from "next/og";

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
          backgroundColor: "#f5f7f7",
          color: "#0f1516",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
            <path fill="#0f1516" fillRule="evenodd" d="M0 0H100V100H30L0 70Z M12 12H88V88H35L12 65Z" />
            <rect x="27" y="25" width="10" height="36" fill="#0f1516" />
            <rect x="45" y="25" width="10" height="36" fill="#62c6da" />
            <rect x="63" y="25" width="10" height="36" fill="#0f1516" />
            <rect x="27" y="65" width="46" height="10" fill="#0f1516" />
          </svg>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
            Eterneon
          </div>
        </div>

        <div style={{ fontSize: 76, lineHeight: 1.03, letterSpacing: "-0.03em", maxWidth: 980 }}>
          Eterneon makes software for small businesses.
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#4a5759" }}>
          Home of Muster. Run by one person in California.
        </div>
      </div>
    ),
    size,
  );
}
