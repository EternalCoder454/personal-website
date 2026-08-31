"use client";

/* No React state: the inline script sets data-theme before paint, and
   mirroring it would swap the icon on hydration. CSS picks the icon. */
const THEME_COLOR = { dark: "#141218", light: "#fef7ff" };

export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[next]);

    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage blocked; the toggle still works for this visit */
    }
  }

  return (
    <button className="theme-toggle icon-button" type="button" onClick={toggle}>
      <span className="icon theme-toggle__sun" aria-hidden="true">
        light_mode
      </span>
      <span className="icon theme-toggle__moon" aria-hidden="true">
        dark_mode
      </span>
      <span className="sr-only">Switch between light and dark theme</span>
    </button>
  );
}
