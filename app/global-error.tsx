"use client";

/**
 * The last boundary. It replaces the root layout when the failure is in
 * the layout itself, so it renders its own html and body and cannot rely
 * on the stylesheet having loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 24px",
          backgroundColor: "#0a1011",
          color: "#e8efee",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: "40rem", margin: "0 auto", width: "100%" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>
            Eterneon did not load.
          </h1>
          <p style={{ color: "#9dacab", lineHeight: 1.6 }}>
            Something failed before the page could render. Reloading fixes most of these.
          </p>
          {error.digest ? (
            <p style={{ color: "#6d7f7e", fontFamily: "ui-monospace, monospace" }}>
              Reference {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              minHeight: 48,
              padding: "0 1.75rem",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#4fd8be",
              color: "#00312a",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
