import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Pixel art and builds by EternalHell.",
};

export default function GalleryPage() {  return (
    <main className="content content--wide">
      <Gallery />
      <footer className="footer">
        {profile.name} · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
