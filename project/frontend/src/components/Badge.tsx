type BadgeKind = "pass" | "fail" | "warn" | "neutral";

const LABEL: Record<string, string> = {
  OK: "OK",
  OCR_FAIL: "OCR 실패",
  PASS: "PASS",
  FAIL: "FAIL",
  "N/A": "N/A",
  INCOMPLETE: "INCOMPLETE",
  default: "기본값",
  user: "사용자 수정",
};

const KIND_MAP: Record<string, BadgeKind> = {
  OK: "pass",
  PASS: "pass",
  OCR_FAIL: "fail",
  FAIL: "fail",
  "N/A": "neutral",
  INCOMPLETE: "warn",
  default: "neutral",
  user: "warn",
};

export function Badge({ value }: { value: string }) {
  const kind = KIND_MAP[value] ?? "neutral";
  return <span className={`badge badge-${kind}`}>{LABEL[value] ?? value}</span>;
}
