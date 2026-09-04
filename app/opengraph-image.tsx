import { ImageResponse } from "next/og";

export const alt = "Eterneon: the department heads your business is missing";
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
          {/* The real mark from the kit. Satori draws inline SVG, so the
              cut corner and the evenodd frame both survive. */}
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <path
              fill="#e7e8e9"
              fillRule="evenodd"
              d="M0 0H100V100H30L0 70Z M12 12H88V88H35L12 65Z"
            />
            <rect x="27" y="25" width="10" height="36" fill="#e7e8e9" />
            <rect x="45" y="25" width="10" height="36" fill="#62c6da" />
            <rect x="63" y="25" width="10" height="36" fill="#e7e8e9" />
            <rect x="27" y="65" width="46" height="10" fill="#e7e8e9" />
          </svg>
          <div
            style={{
              fontSize: 34,
              letterSpacing: "-0.02em",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            Eterneon
          </div>
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
            PRIVATE BETA
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
            Every department head your business is missing.
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
            Marketing, Finance, Legal, Operations and four more, in one private workspace.
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
