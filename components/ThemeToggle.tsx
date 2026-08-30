"use client";

/* No React state on purpose.
 *
 * The theme is already applied to <html> by the inline script in the layout,
 * before first paint. Mirroring it in state would mean the server rendering
 * one icon and the client swapping to another on hydration. Reading and
 * writing the DOM directly, and letting CSS pick the icon from the same
 * data-theme attribute, keeps the button correct at every moment.
 */
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
      /* private mode, or storage blocked - the toggle still works for this visit */
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
