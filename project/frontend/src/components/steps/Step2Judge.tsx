import { Badge } from "../Badge";
import { KpiTile } from "../KpiTile";
import type { JudgeResponse } from "../../types";

interface Props {
  locked: boolean;
  cfDb: number;
  onCfChange: (v: number) => void;
  onOpenLimitEditor: () => void;
  onRunJudge: () => void;
  canJudge: boolean;
  loading: boolean;
  judge: JudgeResponse | null;
}

const VERDICT_COLOR: Record<string, string> = {
  PASS: "var(--color-pass-strong)",
  FAIL: "var(--color-fail-strong)",
  INCOMPLETE: "var(--color-neutral-800)",
};

export function Step2Judge({
  locked,
  cfDb,
  onCfChange,
  onOpenLimitEditor,
  onRunJudge,
  canJudge,
  loading,
  judge,
}: Props) {
  if (locked) {
    return (
      <div className="card" style={{ opacity: 0.5, textAlign: "center", padding: 48 }}>
        <p>STEP 1에서 OCR 결과가 1건 이상 확보되면 잠금이 해제됩니다.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>STEP 2 · PASS / FAIL 판정</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div>
            <label htmlFor="cf">CF (dB)</label>
            <input
              id="cf"
              className="input"
              type="number"
              step="0.1"
              value={cfDb}
              onChange={(e) => onCfChange(Number(e.target.value))}
              style={{ width: 140, marginTop: 6, display: "block" }}
            />
          </div>
          <button className="btn btn-ghost" onClick={onOpenLimitEditor}>
            Limit 설정
          </button>
          <button className="btn btn-primary" disabled={!canJudge || loading} onClick={onRunJudge}>
            {loading ? "판정 실행 중…" : "판정 실행"}
          </button>
        </div>
      </div>

      {judge && (
        <>
          <div
            className="kpi-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
          >
            <KpiTile label="총 건수" value={judge.summary.total} />
            <KpiTile label="PASS" value={judge.summary.pass} color="var(--color-pass-strong)" />
            <KpiTile label="FAIL" value={judge.summary.fail} color="var(--color-fail-strong)" />
            <KpiTile
              label="종합판정"
              value={judge.summary.verdict}
              color={VERDICT_COLOR[judge.summary.verdict]}
            />
          </div>

          <div className="card table-scroll" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>순번</th>
                  <th>파일명</th>
                  <th>주파수 (MHz)</th>
                  <th>측정전력 (µW)</th>
                  <th>dBm</th>
                  <th>dBµV/m</th>
                  <th>Limit</th>
                  <th>마진 (dB)</th>
                  <th>판정</th>
                </tr>
              </thead>
              <tbody>
                {judge.rows.map((r) => (
                  <tr key={r.no} className={r.verdict === "FAIL" ? "row-fail" : undefined}>
                    <td>{r.no}</td>
                    <td>{r.file}</td>
                    <td>{r.freq_mhz.toFixed(3)}</td>
                    <td>{r.power_uw.toFixed(2)}</td>
                    <td>{r.dbm.toFixed(2)}</td>
                    <td>{r.dbuv_m.toFixed(2)}</td>
                    <td>{r.limit ?? "-"}</td>
                    <td>{r.margin !== null ? r.margin.toFixed(2) : "-"}</td>
                    <td>
                      <Badge value={r.verdict} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
