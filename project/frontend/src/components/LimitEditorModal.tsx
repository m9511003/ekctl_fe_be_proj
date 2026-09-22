import { useEffect, useState } from "react";
import type { LimitRow, LimitsSource } from "../types";
import { Badge } from "./Badge";

interface Props {
  open: boolean;
  rows: LimitRow[];
  source: LimitsSource;
  onClose: () => void;
  onSave: (rows: LimitRow[]) => Promise<void>;
  onReset: () => Promise<void>;
}

function validateLocal(rows: LimitRow[]): string | null {
  if (rows.length === 0) return "행이 최소 1개 이상이어야 합니다.";
  for (const r of rows) {
    if (r.freq_min_mhz <= 0 || r.freq_max_mhz <= 0) return "주파수 값은 0보다 커야 합니다.";
    if (r.freq_min_mhz >= r.freq_max_mhz) return "하한이 상한보다 작아야 합니다.";
  }
  const sorted = [...rows].sort((a, b) => a.freq_min_mhz - b.freq_min_mhz);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].freq_max_mhz > sorted[i + 1].freq_min_mhz) return "구간이 중복됩니다.";
  }
  return null;
}

export function LimitEditorModal({ open, rows, source, onClose, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<LimitRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(rows);
      setError(null);
    }
  }, [open, rows]);

  if (!open) return null;

  const updateRow = (idx: number, patch: Partial<LimitRow>) => {
    setDraft((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (idx: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    setDraft((prev) => [...prev, { freq_min_mhz: 0, freq_max_mhz: 0, limit_dbuv_m: 0 }]);
  };

  const handleSave = async () => {
    const err = validateLocal(draft);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,15,16,0.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: 480,
          height: "100%",
          borderRadius: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Limit 테이블 설정</h3>
          <Badge value={source} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {draft.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input"
                type="number"
                value={r.freq_min_mhz}
                onChange={(e) => updateRow(i, { freq_min_mhz: Number(e.target.value) })}
                style={{ width: 80 }}
                placeholder="하한(MHz)"
              />
              <span>~</span>
              <input
                className="input"
                type="number"
                value={r.freq_max_mhz}
                onChange={(e) => updateRow(i, { freq_max_mhz: Number(e.target.value) })}
                style={{ width: 80 }}
                placeholder="상한(MHz)"
              />
              <input
                className="input"
                type="number"
                step="0.1"
                value={r.limit_dbuv_m}
                onChange={(e) => updateRow(i, { limit_dbuv_m: Number(e.target.value) })}
                style={{ width: 90 }}
                placeholder="Limit(dBµV/m)"
              />
              <button
                onClick={() => removeRow(i)}
                className="btn btn-ghost"
                style={{ height: 36, padding: "0 10px" }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary" onClick={addRow}>
          행 추가
        </button>

        {error && (
          <p style={{ color: "var(--color-fail-strong)", fontSize: 13, margin: 0 }}>{error}</p>
        )}

        <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              await onReset();
              onClose();
            }}
          >
            기본값 복원
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
