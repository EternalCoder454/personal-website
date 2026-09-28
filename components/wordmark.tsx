/**
 * The Eterneon lockup from the brand kit: the icon and the wordmark together.
 *
 * Images of the kit's own SVGs rather than a mark redrawn here, so the site
 * and the kit cannot drift apart. The kit comes in two: warm is the dark
 * version, for dark pages, and cyan is the light version, for light pages.
 * The Muster pages are dark; the company home is light.
 */
export function Wordmark({
  tone = "dark",
  height = 30,
}: {
  tone?: "dark" | "light";
  height?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG from public/
    <img
      src={`/brand/eterneon-lockup-${tone}.svg`}
      alt="Eterneon"
      width={Math.round((height * 419) / 96)}
      height={height}
      className="block"
    />
  );
}
