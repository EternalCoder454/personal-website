import { SiteHeader } from "@/components/site-header";

/**
 * The Muster pages: the product page and the beta's terms and privacy notice.
 *
 * A route group, so the URLs stay /muster, /privacy and /terms while these
 * pages share the Muster header, its dark theme and its share card. The
 * company home at / has its own.
 */
export default function MusterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
