import "server-only";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export type ExportColumn<T> = {
  header: string;
  get: (row: T) => string | number;
  /** Column width hint for the Excel sheet, in characters — ignored by
   * CSV/PDF. */
  width?: number;
};

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  // Quote whenever the value could otherwise be misread as a delimiter,
  // a newline inside a cell, or (leading ' guard aside) get opened as a
  // formula by Excel/Sheets — a quoted string is never auto-evaluated.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Plain CSV, UTF-8 BOM-prefixed so Excel opens Arabic/accented text
 * correctly instead of guessing the wrong codepage. */
export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCsvCell(c.get(row))).join(","));
  return "﻿" + [header, ...body].join("\r\n");
}

export async function toXlsxBuffer<T>(rows: T[], columns: ExportColumn<T>[], sheetName: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.header, width: c.width ?? 20 }));
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) {
    sheet.addRow(columns.map((c) => c.get(row)));
  }
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * A simple tabular PDF report: title, generated-at timestamp, then rows
 * as text lines (not a real ruled table — pdfkit has no table primitive,
 * and a hand-rolled one is more machinery than a one-click export needs).
 * Paginates automatically once a page fills.
 */
export async function toPdfBuffer<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  title: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text(title);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text(`Generated ${new Date().toLocaleString("en-GB")} · ${rows.length} row${rows.length === 1 ? "" : "s"}`);
    doc.moveDown(1);
    doc.fillColor("#123543"); // brand-900 — dark teal, never plain black.

    const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / columns.length;

    function drawRow(cells: string[], bold: boolean) {
      const y = doc.y;
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8);
      cells.forEach((cell, i) => {
        doc.text(cell, doc.page.margins.left + i * colWidth, y, { width: colWidth - 6, ellipsis: true });
      });
      doc.moveDown(0.6);
    }

    drawRow(columns.map((c) => c.header), true);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.3);

    for (const row of rows) {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 20) doc.addPage();
      drawRow(
        columns.map((c) => String(c.get(row))),
        false,
      );
    }

    doc.end();
  });
}

export function contentTypeFor(format: string): string {
  if (format === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (format === "pdf") return "application/pdf";
  return "text/csv; charset=utf-8";
}
