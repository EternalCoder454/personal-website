"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profile } from "@/lib/site";
import { Ripples, useRipples } from "./Ripple";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/gallery", label: "Gallery", icon: "photo_library" },
];

/* Gallery stays lit on its category pages. "/" is exact, or it would match
   every route. */
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  const { drops, onPointerDown, clear } = useRipples();

  return (
    <Link
      href={href}
      className={`nav__link${active ? " nav__link--active" : ""}`}
      aria-current={active ? "page" : undefined}
      onPointerDown={onPointerDown}
    >
      <span className="icon nav__icon" aria-hidden="true">
        {icon}
      </span>
      {label}
      <Ripples drops={drops} clear={clear} />
    </Link>
  );
}

/* On the home page the title waits until the hero name has scrolled away, so
   the name is never on screen twice. Elsewhere it stays up. */
export default function TopAppBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const hero = document.getElementById("hero-name");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  const classes = [
    "top-app-bar",
    !isHome && "top-app-bar--static",
    isHome && scrolledPast && "top-app-bar--scrolled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      <span className="top-app-bar__title" aria-hidden={isHome && !scrolledPast}>
        {profile.brand}
      </span>
      <nav className="nav" aria-label="Primary">
        {LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={isActive(pathname, link.href)}
          />
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
