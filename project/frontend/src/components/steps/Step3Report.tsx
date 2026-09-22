import type { ReportMeta } from "../../types";

interface Props {
  locked: boolean;
  meta: ReportMeta;
  onMetaChange: (meta: ReportMeta) => void;
  onDownloadXlsx: () => void;
  onDownloadDocx: () => void;
  downloading: "xlsx" | "docx" | null;
}

export function Step3Report({
  locked,
  meta,
  onMetaChange,
  onDownloadXlsx,
  onDownloadDocx,
  downloading,
}: Props) {
  if (locked) {
    return (
      <div className="card" style={{ opacity: 0.5, textAlign: "center", padding: 48 }}>
        <p>STEP 2에서 판정 결과가 존재해야 잠금이 해제됩니다.</p>
      </div>
    );
  }

  const field = (key: keyof ReportMeta, label: string) => (
    <div>
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        className="input"
        value={meta[key]}
        onChange={(e) => onMetaChange({ ...meta, [key]: e.target.value })}
        style={{ width: 220, marginTop: 6, display: "block" }}
      />
    </div>
  );

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>STEP 3 · 보고서 작성</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {field("tester", "담당자")}
        {field("sample_name", "시료명")}
        {field("reviewer", "검토자")}
      </div>

      <hr className="divider" style={{ margin: "24px 0" }} />

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-secondary" disabled={downloading !== null} onClick={onDownloadXlsx}>
          {downloading === "xlsx" ? "다운로드 중…" : "Excel 다운로드"}
        </button>
        <button className="btn btn-secondary" disabled={downloading !== null} onClick={onDownloadDocx}>
          {downloading === "docx" ? "다운로드 중…" : "보고서(DOCX) 다운로드"}
        </button>
      </div>
    </div>
  );
}
