import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/lib/site";

/* Generated once at build time and served as a static PNG. Applies to every
   route that does not define its own. */
export const alt = `${profile.name} - ${profile.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Same framing as the site's avatar: a 384px window of the 450px render
   centred on (225, 180), scaled to the 260px circle used here. */
const CIRCLE = 260;
const SCALE = CIRCLE / 384;
const IMG = Math.round(450 * SCALE);
const OFFSET_X = Math.round(CIRCLE / 2 - 225 * SCALE);
const OFFSET_Y = Math.round(CIRCLE / 2 - 180 * SCALE);

export default async function OpengraphImage() {
  const avatar = await readFile(join(process.cwd(), "public", "pfp.png"));
  const avatarSrc = `data:image/png;base64,${avatar.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          background: "#141218",
          backgroundImage:
            "radial-gradient(circle at 22% 28%, #3b2a63 0%, rgba(59,42,99,0) 55%), radial-gradient(circle at 80% 76%, #4f378b 0%, rgba(79,55,139,0) 55%)",
        }}
      >
        {/* A background rather than an <img>: Satori does not clip absolutely
            positioned children with overflow:hidden, so the render spilled out
            of the circle. A background is always clipped to the border box. */}
        <div
          style={{
            display: "flex",
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: CIRCLE,
            backgroundColor: "#36343b",
            backgroundImage: `url(${avatarSrc})`,
            backgroundSize: `${IMG}px ${IMG}px`,
            backgroundPosition: `${OFFSET_X}px ${OFFSET_Y}px`,
            backgroundRepeat: "no-repeat",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, color: "#e6e0e9", letterSpacing: -2 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 34, color: "#cac4d0", marginTop: 10 }}>
            {profile.tagline}
          </div>
          <div style={{ fontSize: 26, color: "#d0bcff", marginTop: 28 }}>
            eterneon.net
          </div>
        </div>
      </div>
    ),
    size
  );
}
