import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import { profile } from "@/lib/site";
import { getSections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Pixel art and builds by EternalHell.",
};

export default async function GalleryPage() {
  const sections = await getSections();

  return (
    <main className="content content--wide">
      <Gallery sections={sections} />
      <footer className="footer">
        {profile.name} · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
