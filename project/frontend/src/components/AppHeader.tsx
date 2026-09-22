import { Badge } from "./Badge";

export type ConnectionStatus = "checking" | "key_loaded" | "dry_run" | "disconnected";

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  checking: "연결 확인 중",
  key_loaded: "Key 로드",
  dry_run: "dry-run",
  disconnected: "연결 실패",
};

const STATUS_BADGE: Record<ConnectionStatus, string> = {
  checking: "N/A",
  key_loaded: "OK",
  dry_run: "INCOMPLETE",
  disconnected: "OCR_FAIL",
};

const STEPS = [
  { no: 1, label: "이미지 판독" },
  { no: 2, label: "판정" },
  { no: 3, label: "보고서 작성" },
] as const;

export function AppHeader({
  step,
  connection,
}: {
  step: 1 | 2 | 3;
  connection: ConnectionStatus;
}) {
  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--color-white)",
        borderBottom: "1px solid var(--color-neutral-200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-lg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <h2 style={{ color: "var(--color-brand-reflex)" }}>QUEST</h2>
        <nav style={{ display: "flex", gap: 20 }}>
          {STEPS.map((s) => (
            <div
              key={s.no}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: s.no === step ? 1 : 0.5,
                fontWeight: s.no === step ? 700 : 400,
                fontSize: 14,
                borderBottom: s.no === step ? "3px solid var(--color-primary)" : "none",
                paddingBottom: 2,
              }}
            >
              <span>STEP {s.no}</span>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span className="step-label" style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
          {STATUS_LABEL[connection]}
        </span>
        <Badge value={STATUS_BADGE[connection]} />
      </div>
    </header>
  );
}
