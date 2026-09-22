export type OcrStatus = "OK" | "OCR_FAIL";

export interface OcrRow {
  file: string;
  center_freq_ghz: number | null;
  marker_freq_ghz: number | null;
  marker_power_uw: number | null;
  timestamp: string | null;
  status: OcrStatus;
}

export interface LimitRow {
  freq_min_mhz: number;
  freq_max_mhz: number;
  limit_dbuv_m: number;
}

export type LimitsSource = "default" | "user";

export interface LimitsResponse {
  rows: LimitRow[];
  source: LimitsSource;
}

export type Verdict = "PASS" | "FAIL" | "N/A";
export type OverallVerdict = "PASS" | "FAIL" | "INCOMPLETE";

export interface JudgeRow {
  no: number;
  file: string;
  freq_mhz: number;
  power_uw: number;
  dbm: number;
  dbuv_m: number;
  limit: number | null;
  margin: number | null;
  verdict: Verdict;
}

export interface JudgeSummary {
  total: number;
  pass: number;
  fail: number;
  verdict: OverallVerdict;
}

export interface JudgeResponse {
  rows: JudgeRow[];
  summary: JudgeSummary;
}

export interface ReportMeta {
  tester: string;
  sample_name: string;
  reviewer: string;
}

export interface HealthResponse {
  status: string;
  api_key_loaded: boolean;
}
