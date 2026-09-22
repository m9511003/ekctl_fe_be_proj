import { apiGet, apiPost, apiPut, apiPostFile, apiPostForm } from "./client";
import type {
  HealthResponse,
  LimitsResponse,
  LimitRow,
  OcrRow,
  JudgeResponse,
  ReportMeta,
} from "../types";

export const getHealth = () => apiGet<HealthResponse>("/api/health");

export const getLimits = () => apiGet<LimitsResponse>("/api/limits");

export const putLimits = (rows: LimitRow[]) =>
  apiPut<LimitsResponse>("/api/limits", { rows });

export const resetLimits = () => apiPost<LimitsResponse>("/api/limits/reset");

export const runOcr = (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return apiPostForm<OcrRow[]>("/api/ocr", form);
};

export const runJudge = (rows: OcrRow[], cfDb: number) =>
  apiPost<JudgeResponse>("/api/judge", { rows, cf_db: cfDb });

export const exportXlsx = (judge: JudgeResponse, cfDb: number) =>
  apiPostFile("/api/export/xlsx", { ...judge, cf_db: cfDb });

export const exportDocx = (judge: JudgeResponse, cfDb: number, meta: ReportMeta) =>
  apiPostFile("/api/export/docx", { ...judge, cf_db: cfDb, ...meta });
