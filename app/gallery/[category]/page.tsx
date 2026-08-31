import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GalleryGrid from "@/components/GalleryGrid";
import Footer from "@/components/Footer";
import { gallery, sectionFor } from "@/lib/site";

type Params = { params: Promise<{ category: string }> };

/* Every category is known at build time, so all of them prerender. */
export function generateStaticParams() {
  return gallery.map((section) => ({ category: section.slug }));
}

/* A slug that is not in `gallery` is a 404, not an empty page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const section = sectionFor(category);
  if (!section) return {};

  const description = `${section.blurb} By EternalHell.`;
  const url = `/gallery/${section.slug}`;

  return {
    title: section.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${section.title} · EternalHell`,
      description,
      url,
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const section = sectionFor(category);
  if (!section) notFound();

  return (
    <main className="content content--wide" id="main">
      <section className="card card--flush" aria-labelledby="category-label">
        <div className="section-head">
          <Link className="icon-button section-head__back" href="/gallery" aria-label="Back to gallery">
            <span className="icon" aria-hidden="true">
              arrow_back
            </span>
          </Link>
          <h1 className="card__header section-head__title" id="category-label">
            {section.title}
          </h1>
        </div>

        <GalleryGrid section={section} />
      </section>

      <Footer />
    </main>
  );
}
