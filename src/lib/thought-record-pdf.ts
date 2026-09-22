"use client";

// Builds the "Download PDF" export for a Thought Record history list,
// entirely in the browser — this data lives only in the device's encrypted
// IndexedDB store (see cbt-history.ts) and is never sent to our servers.
// Same html2canvas + jsPDF approach as journal-pdf.ts, needed for the same
// reason: jsPDF's built-in fonts can't shape Arabic on their own, so each
// entry is rendered as real HTML and rasterized into the PDF.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso: string, locale: "en" | "ar"): string {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const BLOCK_STYLE =
  "font-family: -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif; color: #17303a; background: #fff; padding: 14px 18px; box-sizing: border-box;";

export interface ThoughtRecordPdfEntry {
  id: string;
  createdAt: string;
  data: Record<string, string>;
}

function entryHtml(entry: ThoughtRecordPdfEntry, columns: { key: string; label: string }[], locale: "en" | "ar"): string {
  const rows = columns
    .filter((c) => entry.data[c.key]?.trim())
    .map(
      (c) =>
        `<div style="margin-top:10px;">
          <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:.03em; color:#6b8086;">${escapeHtml(c.label)}</p>
          <p style="margin:2px 0 0; font-size:13px; white-space:pre-wrap; line-height:1.6;">${escapeHtml(entry.data[c.key])}</p>
        </div>`,
    )
    .join("");
  return `<div style="${BLOCK_STYLE} border:1px solid #e3edf0; border-radius:14px; margin-top:12px;">
    <p style="margin:0; font-size:12px; color:#6b8086; font-weight:600;">${formatDate(entry.createdAt, locale)}</p>
    ${rows}
  </div>`;
}

export async function buildThoughtRecordHistoryPdf(options: {
  entries: ThoughtRecordPdfEntry[];
  columns: { key: string; label: string }[];
  title: string;
  locale?: "en" | "ar";
}): Promise<Blob> {
  const locale = options.locale ?? "en";
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);

  const CONTAINER_WIDTH = 700;
  const container = document.createElement("div");
  container.style.cssText = `position:fixed; left:-9999px; top:0; width:${CONTAINER_WIDTH}px;`;

  const blocksHtml: string[] = [
    `<div style="${BLOCK_STYLE}"><h1 style="margin:0; font-size:26px;">${escapeHtml(options.title)}</h1><p style="margin:6px 0 0; font-size:12px; color:#6b8086;">${formatDate(new Date().toISOString(), locale)}</p></div>`,
  ];
  for (const entry of options.entries) blocksHtml.push(entryHtml(entry, options.columns, locale));

  container.innerHTML = blocksHtml.join("");
  document.body.appendChild(container);

  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    let cursorY = margin;
    let firstBlock = true;

    for (const block of Array.from(container.children) as HTMLElement[]) {
      const canvas = await html2canvas(block, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      if (!firstBlock && cursorY + imgHeight > margin + usableHeight) {
        doc.addPage();
        cursorY = margin;
      }
      doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", margin, cursorY, usableWidth, imgHeight);
      cursorY += imgHeight + 10;
      firstBlock = false;
    }

    return doc.output("blob");
  } finally {
    document.body.removeChild(container);
  }
}
