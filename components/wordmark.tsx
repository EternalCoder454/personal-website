/**
 * The brand mark and lockup, taken from the kit rather than invented.
 *
 * Three bars and a baseline inside a panel with one corner cut away,
 * with the middle bar carrying the accent. Geometry copied exactly from
 * eterneon-icon-*.svg: the two subpaths plus `evenodd` are what make the
 * outer shape a frame rather than a solid block, so do not simplify them
 * apart. The one-bar mark in the kit is for the favicon, where three
 * bars turn to mush, and is a file rather than a component.
 */
export function LogoIcon({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M0 0H100V100H30L0 70Z M12 12H88V88H35L12 65Z"
      />
      <rect x="27" y="25" width="10" height="36" fill="currentColor" />
      <rect x="45" y="25" width="10" height="36" className="text-primary" fill="currentColor" />
      <rect x="63" y="25" width="10" height="36" fill="currentColor" />
      <rect x="27" y="65" width="46" height="10" fill="currentColor" />
    </svg>
  );
}

/**
 * The lockup: the full three-bar icon plus the name.
 *
 * This is the horizontal lockup from the kit, so it takes the icon and
 * not the simple one-bar mark. The simple mark exists for the sizes
 * where three bars would turn to mush, which in practice means the
 * favicon at 16 and 32px and nothing on this page.
 */
export function Wordmark() {
  return (
    <span className="flex items-center gap-3">
      <LogoIcon className="text-on-surface" size={30} />
      {/* Geist, heavy, uppercase, tight. Set the way the kit sets it,
          not in the editorial serif that is for headlines only. */}
      <span className="font-sans text-[20px] font-black tracking-[-0.02em] text-on-surface uppercase">
        Eterneon
      </span>
    </span>
  );
}
