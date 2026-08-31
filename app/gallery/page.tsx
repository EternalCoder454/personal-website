import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Pixel art and Minecraft builds by EternalHell.",
  alternates: { canonical: "/gallery" },
  /* openGraph is inherited from the root layout, so without this the shared
     link would still say "EternalHell" rather than naming the page. */
  openGraph: {
    title: "Gallery · EternalHell",
    description: "Pixel art and Minecraft builds by EternalHell.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <main className="content content--wide" id="main">
      <Gallery />
      <Footer />
    </main>
  );
}
