import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Pixel art and builds by EternalHell.",
};

export default function GalleryPage() {
  return (
    <main className="content content--wide" id="main">
      <Gallery />
      <Footer />
    </main>
  );
}
