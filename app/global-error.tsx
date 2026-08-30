"use client";

import { Roboto } from "next/font/google";
import "./globals.css";

/* Replaces the root layout entirely, so it brings its own html, body,
   stylesheet and font. */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap",
});

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <main className="content">
          <section className="card message">
            <h1 className="message__title">Something broke</h1>
            <p className="message__text">The site failed to load. Try reloading the page.</p>
            <div className="message__actions">
              <button className="button button--filled" type="button" onClick={reset}>
                Reload
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
