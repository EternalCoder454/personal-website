import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { gallery } from "@/lib/site";

const DESCRIPTION = "Minecraft builds, pixel art and websites by EternalHell.";

export const metadata: Metadata = {
  title: "Gallery",
  description: DESCRIPTION,
  alternates: { canonical: "/gallery" },
  /* openGraph is inherited from the root layout, so without this the shared
     link would still say "EternalHell" rather than naming the page. */
  openGraph: {
    title: "Gallery · EternalHell",
    description: DESCRIPTION,
    url: "/gallery",
  },
};

function count(n: number) {
  if (n === 0) return "Nothing yet";
  return n === 1 ? "1 piece" : `${n} pieces`;
}

export default function GalleryPage() {
  return (
    <main className="content content--wide" id="main">
      <section className="card card--flush" aria-labelledby="gallery-label">
        <h1 className="card__header" id="gallery-label">
          Gallery
        </h1>

        <div className="categories">
          {gallery.map((section, index) => (
            <Link
              key={section.slug}
              href={`/gallery/${section.slug}`}
              className="category"
              style={{ "--index": index } as React.CSSProperties}
            >
              <span className="category__cover">
                {section.pieces.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={section.pieces[0].src} alt="" aria-hidden="true" />
                ) : (
                  <span className="icon category__glyph" aria-hidden="true">
                    {section.icon}
                  </span>
                )}
              </span>

              <span className="category__text">
                <span className="category__title">{section.title}</span>
                <span className="category__blurb">{section.blurb}</span>
              </span>

              <span className="category__meta">
                {count(section.pieces.length)}
                <span className="icon" aria-hidden="true">
                  chevron_right
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
