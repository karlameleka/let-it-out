"use client";

// iOS Safari only allows window.open() to succeed when it's called
// synchronously inside the click handler that triggered it — once any
// `await` happens first (fetching data, building a PDF), the browser has
// already dropped the "user activation" and the call is silently
// swallowed, with no error and nothing visibly happening. iOS also
// doesn't honor <a download> on a blob: URL the way desktop browsers do,
// so even a same-tab anchor click wouldn't trigger a real download there
// anyway — the expected iOS behavior is to open the file in Safari's own
// viewer, where the person can share/save it from the toolbar.
//
// The fix: call reserveDownloadWindow() synchronously, as the very first
// thing in the click handler, before any await. On iOS this opens a
// blank tab while the gesture is still active; everywhere else it's a
// no-op (desktop's anchor-click download works fine as-is). Once the
// file is ready, deliverBlob() either points that reserved tab at it
// (iOS) or triggers the usual anchor-click download (everywhere else).

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ masquerades as desktop Safari (navigator.platform
  // "MacIntel"), distinguishable from an actual Mac only by touch support.
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function reserveDownloadWindow(): Window | null {
  if (typeof window === "undefined" || !isIOS()) return null;
  return window.open("", "_blank");
}

export function deliverBlob(blob: Blob, filename: string, reservedWindow: Window | null): void {
  const url = URL.createObjectURL(blob);
  if (reservedWindow) {
    reservedWindow.location.href = url;
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
