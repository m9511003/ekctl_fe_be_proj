import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { Badge } from "../Badge";
import type { OcrRow } from "../../types";

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  ocrRows: OcrRow[];
  loading: boolean;
  onRunOcr: () => void;
  onReset: () => void;
}

export function Step1Upload({ files, onFilesChange, ocrRows, loading, onRunOcr, onReset }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const pngs = Array.from(list).filter((f) => f.type === "image/png");
    onFilesChange([...files, ...pngs]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>STEP 1 · 스펙트럼 화면 판독 (OCR)</h3>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-neutral-300)"}`,
            borderRadius: "var(--radius-lg)",
            minHeight: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: dragOver ? "var(--color-primary-container)" : "transparent",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: 0, color: "var(--color-neutral-600)" }}>
            PNG 파일을 드래그하거나 클릭해서 선택하세요
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {files.map((f) => (
              <span
                key={f.name}
                className="badge badge-neutral"
                style={{ gap: 6, paddingRight: 6 }}
              >
                {f.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.name);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-neutral-500)",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-primary" disabled={files.length === 0 || loading} onClick={onRunOcr}>
            {loading ? "OCR 실행 중…" : "OCR 실행"}
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            초기화
          </button>
        </div>

        {loading && (
          <div className="progress-bar-track" style={{ marginTop: 16 }}>
            <div className="progress-bar-fill" style={{ width: "70%" }} />
          </div>
        )}
      </div>

      {ocrRows.length > 0 && (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>파일명</th>
                <th>Center (GHz)</th>
                <th>Mkr1 주파수 (GHz)</th>
                <th>Mkr1 전력 (µW)</th>
                <th>측정시각</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {ocrRows.map((r) => (
                <tr key={r.file} className={r.status === "OCR_FAIL" ? "row-fail" : undefined}>
                  <td>{r.file}</td>
                  <td>{r.center_freq_ghz ?? "-"}</td>
                  <td>{r.marker_freq_ghz ?? "-"}</td>
                  <td>{r.marker_power_uw ?? "-"}</td>
                  <td>{r.timestamp ?? "-"}</td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
