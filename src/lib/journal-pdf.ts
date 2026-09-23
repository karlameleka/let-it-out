"use client";

// Builds the "Download my journal entries" export as a PDF, entirely in
// the browser — the server never sees this content (journal/reflection/
// assessment data is device-only, see local-journal.ts). Journal entries
// (and this whole app) are bilingual English/Arabic, and jsPDF's built-in
// fonts can't shape Arabic script on their own, so rather than embedding a
// font and a reshaping/bidi library, each block is rendered as real HTML
// (using the browser's own text engine, which already handles Arabic
// correctly everywhere else in the app) and rasterized into the PDF via
// html2canvas — one canvas per block, stacked with simple page-break math,
// so an entry never gets sliced across a page boundary.
//
// The off-screen content lives in a purpose-built blank <iframe>, not a
// <div> in the main document. html2canvas clones the ENTIRE document that
// owns the element it's rasterizing (to carry over every stylesheet) and
// waits — with no timeout — for that cloned document's `fonts.ready`
// before rendering. In the main document, that set includes this app's
// own web fonts (Inter/Fraunces), and on real iOS/Safari that wait has
// been observed to simply never resolve, hanging the export forever. A
// blank iframe has no stylesheets and no @font-face rules at all (every
// block here is styled with inline `style=""` only), so there's nothing
// for that wait to hang on.

import type { JournalExportEntry } from "@/lib/local-journal";
import type { ReflectionEntry } from "@/lib/local-reflection";
import type { AssessmentResultRecord } from "@/lib/local-assessments";
import { getAssessment } from "@/lib/assessments";
import { moodColor, moodLabel } from "@/lib/moods";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const BLOCK_STYLE =
  "font-family: -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif; color: #17303a; background: #fff; padding: 14px 18px; box-sizing: border-box;";

function sectionHeaderHtml(title: string): string {
  return `<div style="${BLOCK_STYLE} padding-top: 22px;"><h2 style="margin:0; font-size:20px; border-bottom: 2px solid #e3edf0; padding-bottom: 8px;">${escapeHtml(title)}</h2></div>`;
}

function moodChipsHtml(moods: string[], locale: "en" | "ar"): string {
  if (moods.length === 0) return "";
  const chips = moods
    .map(
      (m) =>
        `<span style="display:inline-flex; align-items:center; gap:5px; border:1px solid #d8e6e9; border-radius:999px; padding:3px 10px; font-size:11px; margin-inline-end:6px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:${moodColor(m)};"></span>
          ${escapeHtml(moodLabel(m, locale))}
        </span>`,
    )
    .join("");
  return `<div style="margin-top:8px;">${chips}</div>`;
}

function journalEntryHtml(entry: JournalExportEntry, locale: "en" | "ar"): string {
  const parts: string[] = [];
  parts.push(`<p style="margin:0; font-size:12px; color:#6b8086; font-weight:600;">${formatDate(entry.createdAt)}</p>`);
  parts.push(moodChipsHtml(entry.moods, locale));
  if (entry.prompt) {
    parts.push(
      `<p style="margin:10px 0 0; font-size:12px; text-transform:uppercase; letter-spacing:.03em; color:#3f7a8c;">${escapeHtml(entry.prompt.category)}</p>
       <p style="margin:2px 0 0; font-size:14px; font-style:italic; color:#17303a;">${escapeHtml(entry.prompt.text)}</p>`,
    );
  }
  if (entry.photoUrl) {
    parts.push(`<img src="${entry.photoUrl}" style="margin-top:12px; max-width:220px; max-height:220px; border-radius:10px; display:block;" />`);
  }
  parts.push(`<p style="margin-top:12px; font-size:14px; line-height:1.7; white-space:pre-wrap;">${escapeHtml(entry.content)}</p>`);
  if (entry.songUrl) {
    parts.push(
      `<p style="margin-top:10px; font-size:12px; color:#3f7a8c;">&#9834; <a href="${entry.songUrl}" style="color:#3f7a8c;">${escapeHtml(entry.songName?.trim() || entry.songUrl)}</a></p>`,
    );
  }
  return `<div style="${BLOCK_STYLE} border:1px solid #e3edf0; border-radius:14px; margin-top:12px;">${parts.join("")}</div>`;
}

function reflectionEntryHtml(entry: ReflectionEntry): string {
  const rows = entry.answers
    .filter((a) => a.answerText?.trim())
    .map(
      (a) =>
        `<div style="margin-top:10px;">
          <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:.03em; color:#6b8086;">${escapeHtml(a.questionText)}</p>
          <p style="margin:2px 0 0; font-size:13px;">${escapeHtml(a.answerText)}</p>
        </div>`,
    )
    .join("");
  return `<div style="${BLOCK_STYLE} border:1px solid #e3edf0; border-radius:14px; margin-top:12px;">
    <p style="margin:0; font-size:12px; color:#6b8086; font-weight:600;">${formatDate(entry.createdAt)}</p>
    ${rows}
  </div>`;
}

function assessmentEntryHtml(entry: AssessmentResultRecord): string {
  const def = getAssessment(entry.slug);
  const questionText = new Map((def?.questions ?? []).map((q) => [q.id, q.text]));
  const rows = entry.answers
    .map(
      (a) =>
        `<div style="margin-top:8px; display:flex; justify-content:space-between; gap:12px;">
          <span style="font-size:13px; flex:1;">${escapeHtml(questionText.get(a.questionId) ?? a.questionId)}</span>
          <span style="font-size:13px; font-weight:600; color:#3f7a8c;">${a.value}</span>
        </div>`,
    )
    .join("");
  return `<div style="${BLOCK_STYLE} border:1px solid #e3edf0; border-radius:14px; margin-top:12px;">
    <p style="margin:0; font-size:12px; color:#6b8086; font-weight:600;">${formatDate(entry.createdAt)} &middot; ${escapeHtml(def?.title ?? entry.slug)}</p>
    ${rows}
  </div>`;
}

export async function buildJournalExportPdf(data: {
  journal: { entries: JournalExportEntry[] };
  reflections: ReflectionEntry[];
  assessments: AssessmentResultRecord[];
  locale?: "en" | "ar";
}): Promise<Blob> {
  const locale = data.locale ?? "en";
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);

  const CONTAINER_WIDTH = 700;
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

  const blocksHtml: string[] = [];
  blocksHtml.push(
    `<div style="${BLOCK_STYLE}"><h1 style="margin:0; font-size:26px;">Let It Out &mdash; Journal Export</h1><p style="margin:6px 0 0; font-size:12px; color:#6b8086;">Exported ${formatDate(new Date().toISOString())}</p></div>`,
  );

  if (data.journal.entries.length > 0) {
    blocksHtml.push(sectionHeaderHtml(`Journal Entries (${data.journal.entries.length})`));
    for (const entry of data.journal.entries) blocksHtml.push(journalEntryHtml(entry, locale));
  }
  if (data.reflections.length > 0) {
    blocksHtml.push(sectionHeaderHtml(`Reflections (${data.reflections.length})`));
    for (const entry of data.reflections) blocksHtml.push(reflectionEntryHtml(entry));
  }
  if (data.assessments.length > 0) {
    blocksHtml.push(sectionHeaderHtml(`Assessment Results (${data.assessments.length})`));
    for (const entry of data.assessments) blocksHtml.push(assessmentEntryHtml(entry));
  }

  idoc.body.innerHTML = blocksHtml.join("");

  // Data-URI images (the only kind stored here) render without a network
  // fetch, but the browser still decodes them asynchronously — wait for
  // each one so html2canvas never captures a blank image box.
  const images = Array.from(idoc.body.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }),
    ),
  );

  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
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
