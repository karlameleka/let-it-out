"use client";

// Builds the "Download PDF" export for a Thought Record history list,
// entirely in the browser — this data lives only in the device's encrypted
// IndexedDB store (see cbt-history.ts) and is never sent to our servers.
// Same html2canvas + jsPDF approach as journal-pdf.ts, needed for the same
// reason: jsPDF's built-in fonts can't shape Arabic on their own, so each
// entry is rendered as real HTML and rasterized into the PDF. Rendered as
// a traditional thought-record table (one row per entry, a fixed column
// per field), matching the in-app history view (see cbt-type-history.tsx's
// ThoughtRecordTable) rather than a card per entry — landscape, since nine
// columns need the extra width. Entries are chunked into fixed-size groups,
// each its own table (header repeated) and its own rasterized block, so a
// long history still paginates correctly instead of one giant image
// getting clipped at the page edge.
//
// Rendered inside a purpose-built blank <iframe>, not a <div> in the main
// document — see journal-pdf.ts's header comment for why: html2canvas
// clones the whole owning document and waits (no timeout) on its
// `fonts.ready`, which on real iOS/Safari has been observed to hang
// forever because of this app's own web fonts. A blank iframe has none.

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

// One page's worth of rows — conservative enough that even a few
// multi-sentence cells across a row rarely push a chunk past a landscape
// page's height.
const ROWS_PER_TABLE = 6;

function tableHtml(
  entries: ThoughtRecordPdfEntry[],
  columns: { key: string; label: string; widthPct: number }[],
  dateLabel: string,
  locale: "en" | "ar",
): string {
  const headerCells = [
    `<th style="width:${8}%; text-align:${locale === "ar" ? "right" : "left"};">${escapeHtml(dateLabel)}</th>`,
    ...columns.map(
      (c) => `<th style="width:${c.widthPct}%; text-align:${locale === "ar" ? "right" : "left"};">${escapeHtml(c.label)}</th>`,
    ),
  ].join("");

  const bodyRows = entries
    .map((entry) => {
      const cells = [
        `<td style="white-space:nowrap;">${escapeHtml(formatDate(entry.createdAt, locale))}</td>`,
        ...columns.map((c) => `<td>${escapeHtml(entry.data[c.key]?.trim() || "—")}</td>`),
      ].join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<div style="${BLOCK_STYLE} margin-top:12px;">
    <table dir="${locale === "ar" ? "rtl" : "ltr"}" style="width:100%; border-collapse:collapse; font-size:10px; table-layout:fixed;">
      <thead>
        <tr style="background:#f2f7f8; border-bottom:2px solid #d8e6e9;">${headerCells}</tr>
      </thead>
      <tbody>
        ${bodyRows.replace(/<tr>/g, '<tr style="border-bottom:1px solid #e3edf0; vertical-align:top;">')}
      </tbody>
    </table>
  </div>`;
}

export async function buildThoughtRecordHistoryPdf(options: {
  entries: ThoughtRecordPdfEntry[];
  columns: { key: string; label: string }[];
  dateLabel: string;
  title: string;
  locale?: "en" | "ar";
}): Promise<Blob> {
  const locale = options.locale ?? "en";
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);

  const CONTAINER_WIDTH = 1400;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = `position:fixed; left:-9999px; top:0; width:${CONTAINER_WIDTH}px; height:3000px; border:0;`;
  document.body.appendChild(iframe);
  const idoc = iframe.contentDocument;
  if (!idoc) {
    document.body.removeChild(iframe);
    throw new Error("Could not access export iframe document");
  }
  idoc.body.style.margin = "0";

  // Remaining width split across the 8 data columns, evenly — good enough
  // given every field is free text of roughly comparable length.
  const columns = options.columns.map((c) => ({ ...c, widthPct: 92 / options.columns.length }));

  const blocksHtml: string[] = [
    `<div style="${BLOCK_STYLE}"><h1 style="margin:0; font-size:26px;">${escapeHtml(options.title)}</h1><p style="margin:6px 0 0; font-size:12px; color:#6b8086;">${formatDate(new Date().toISOString(), locale)}</p></div>`,
  ];
  for (let i = 0; i < options.entries.length; i += ROWS_PER_TABLE) {
    const chunk = options.entries.slice(i, i + ROWS_PER_TABLE);
    blocksHtml.push(tableHtml(chunk, columns, options.dateLabel, locale));
  }

  idoc.body.innerHTML = blocksHtml.join("");

  try {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    let cursorY = margin;
    let firstBlock = true;

    for (const block of Array.from(idoc.body.children) as HTMLElement[]) {
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
    document.body.removeChild(iframe);
  }
}
