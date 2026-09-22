import type { TestReportRow } from "../types";

const HEADERS = [
  "파일명",
  "시료명",
  "시험항목",
  "측정값",
  "기준값(Limit)",
  "단위",
  "판정",
  "시험기관",
  "시험일자",
];

function escapeCell(value: string | null): string {
  const text = value ?? "";
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsv(rows: TestReportRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.file,
        r.sample_name,
        r.test_item,
        r.measured_value,
        r.limit_value,
        r.unit,
        r.verdict,
        r.test_org,
        r.test_date,
      ]
        .map(escapeCell)
        .join(","),
    );
  }
  return lines.join("\r\n");
}

export function downloadCsv(rows: TestReportRow[]): void {
  const csv = "﻿" + buildCsv(rows); // UTF-8 BOM (엑셀 한글 깨짐 방지)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  a.href = url;
  a.download = `ocr_result_${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
