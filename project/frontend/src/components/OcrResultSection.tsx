import type { TestReportRow } from "../types";

interface Props {
  rows: TestReportRow[];
  loading: boolean;
  progress: { done: number; total: number } | null;
  onExtractAll: () => void;
  onResetAll: () => void;
}

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

export function OcrResultSection({
  rows,
  loading,
  progress,
  onExtractAll,
  onResetAll,
}: Props) {
  return (
    <section className="card">
      <h3 style={{ marginBottom: 20 }}>
        <span style={{ color: "var(--color-primary)" }}>3.</span> OCR 데이터 추출
      </h3>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button className="btn btn-primary" disabled={loading} onClick={onExtractAll}>
          {loading
            ? `추출 중… (${progress?.done ?? 0}/${progress?.total ?? 0})`
            : "전체 이미지 OCR 추출"}
        </button>
        <button className="btn btn-secondary" disabled={loading} onClick={onResetAll}>
          전체 초기화
        </button>
      </div>

      {loading && (
        <div className="progress-bar-track" style={{ marginBottom: 20 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: progress ? `${(progress.done / Math.max(progress.total, 1)) * 100}%` : "0%",
            }}
          />
        </div>
      )}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  style={{ textAlign: "center", color: "var(--color-neutral-500)" }}
                >
                  추출된 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.file} className={r.status === "OCR_FAIL" ? "row-fail" : undefined}>
                  <td>{r.file}</td>
                  <td>{r.sample_name ?? "-"}</td>
                  <td>{r.test_item ?? "-"}</td>
                  <td>{r.measured_value ?? "-"}</td>
                  <td>{r.limit_value ?? "-"}</td>
                  <td>{r.unit ?? "-"}</td>
                  <td>{r.status === "OCR_FAIL" ? "OCR 실패" : (r.verdict ?? "-")}</td>
                  <td>{r.test_org ?? "-"}</td>
                  <td>{r.test_date ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
