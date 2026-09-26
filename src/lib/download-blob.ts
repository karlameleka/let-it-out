"use client";

// iOS Safari doesn't honor <a download> on a blob: URL — it silently
// ignores the attribute, so the anchor-click trick that works everywhere
// else does nothing there (iOS has no "Downloads folder" concept for web
// content the way desktop browsers do anyway). The two workarounds that
// look tempting both fail on inspection:
//   - Pre-opening a blank tab with window.open() and later pointing it at
//     the blob: URL doesn't work — Safari refuses to load a blob: URL
//     from any window other than the one that created it, even a
//     same-origin tab opened via window.open(). The tab just sits on
//     about:blank forever.
//   - Converting to a data: URI sidesteps that, but every major browser
//     (Chrome, Firefox, Safari) blocks a top-level navigation to a
//     data: URI outright, as an anti-phishing measure — the address bar
//     would show no real origin. This throws immediately, in every tab.
// The one thing that reliably works is navigating the SAME window/tab
// that created the blob directly to it — no popup, no cross-window
// hand-off. Safari opens the PDF in its own viewer (replacing the app
// page), and the person taps Share there to save it — the standard way
// PDFs are "downloaded" on iOS. Everywhere else, the existing
// anchor-click download (a real file download, not just an inline view)
// is unchanged.

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ masquerades as desktop Safari (navigator.platform
  // "MacIntel"), distinguishable from an actual Mac only by touch support.
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function deliverBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  if (isIOS()) {
    // Don't revoke: the navigation away from this page is async, and
    // revoking before it completes would break the PDF load. The blob
    // URL is released automatically once this document is torn down.
    //
    // The #view=FitH fragment is a standard PDF "open parameter" (Adobe
    // Acrobat spec) that Safari's PDFKit-based viewer honors, hinting it
    // to fit the page to the viewport's width on open. Without it, the
    // inline viewer has been observed opening at 100% (actual point
    // size) on iPhone, which is wider than the screen for a normal A4
    // page — the content isn't cut off or lost, but it looks that way
    // until the person manually pinches out.
    window.location.href = `${url}#view=FitH`;
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
