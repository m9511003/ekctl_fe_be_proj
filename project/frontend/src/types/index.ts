export interface ApiSettings {
  apiKey: string;
  model: string;
  endpoint: string;
}

export type OcrStatus = "OK" | "OCR_FAIL";

export interface TestReportRow {
  file: string;
  sample_name: string | null;
  test_item: string | null;
  measured_value: string | null;
  limit_value: string | null;
  unit: string | null;
  verdict: string | null;
  test_org: string | null;
  test_date: string | null;
  status: OcrStatus;
}
