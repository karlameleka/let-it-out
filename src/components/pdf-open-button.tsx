"use client";

/**
 * Opens a PDF stored as a base64 data: URI. Mobile browsers (notably iOS
 * Safari, and increasingly Chrome) block top-level navigation to data:
 * URLs outright as an anti-phishing measure — the `download` attribute
 * doesn't help, and a plain `<a href="data:...">` just silently does
 * nothing on those browsers. The fix is converting to a blob: URL first,
 * which isn't subject to that restriction, then opening/downloading that
 * instead.
 */
function openDataUriPdf(dataUri: string, fileName: string) {
  try {
    const [header, base64] = dataUri.split(",");
    const mime = header.match(/data:(.*?);base64/)?.[1] || "application/pdf";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));

    const opened = window.open(blobUrl, "_blank");
    if (!opened) {
      // Popup blocked — fall back to a direct download click, which
      // browsers allow even when window.open is blocked.
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    // Give the new tab/download time to actually read the blob before
    // revoking it.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    // Last-resort fallback — works on desktop even if something above
    // threw (e.g. malformed data URI).
    window.location.href = dataUri;
  }
}

export default function PdfOpenButton({
  fileData,
  fileName,
  className,
  children,
}: {
  fileData: string;
  fileName: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => openDataUriPdf(fileData, fileName)} className={className}>
      {children}
    </button>
  );
}
