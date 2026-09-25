"use client";

// Catches an error thrown while the root layout itself is rendering (it
// does several DB-backed lookups on every request — session, site
// settings, site text overrides — with nothing else in the app positioned
// to catch a failure there, since error.tsx boundaries wrap everything
// *below* the root layout, not the layout itself). Without this file, a
// transient failure there (e.g. a slow/failed Neon compute resume after
// the connection has been idle) rendered nothing at all instead of a
// retryable message — this is most visible on the installed PWA, which is
// often opened right after a long idle gap. global-error replaces the
// entire document when active, so it can't rely on globals.css/fonts and
// defines its own minimal styling inline.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1e2b30",
        }}
      >
        <div
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#1e5b73",
          }}
        >
          Let It Out
        </div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "24rem", margin: 0, color: "#5a6b70", fontSize: "0.9375rem" }}>
          We couldn&apos;t load the app just now. This is usually temporary, please try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#1e5b73",
            color: "#ffffff",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
