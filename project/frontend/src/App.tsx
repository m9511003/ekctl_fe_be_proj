import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import type { ConnectionStatus } from "./components/AppHeader";
import { Step1Upload } from "./components/steps/Step1Upload";
import { Step2Judge } from "./components/steps/Step2Judge";
import { Step3Report } from "./components/steps/Step3Report";
import { LimitEditorModal } from "./components/LimitEditorModal";
import { useToast } from "./components/Toast";
import {
  getHealth,
  getLimits,
  putLimits,
  resetLimits,
  runOcr,
  runJudge,
  exportXlsx,
  exportDocx,
} from "./api";
import type { JudgeResponse, LimitRow, LimitsSource, OcrRow, ReportMeta } from "./types";

const DEFAULT_CF = -50.0;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const { push } = useToast();

  const [connection, setConnection] = useState<ConnectionStatus>("checking");
  const [view, setView] = useState<1 | 2 | 3>(1);

  const [files, setFiles] = useState<File[]>([]);
  const [ocrRows, setOcrRows] = useState<OcrRow[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [limitRows, setLimitRows] = useState<LimitRow[]>([]);
  const [limitSource, setLimitSource] = useState<LimitsSource>("default");
  const [limitEditorOpen, setLimitEditorOpen] = useState(false);

  const [cfDb, setCfDb] = useState(DEFAULT_CF);
  const [judge, setJudge] = useState<JudgeResponse | null>(null);
  const [judgeLoading, setJudgeLoading] = useState(false);

  const [meta, setMeta] = useState<ReportMeta>({ tester: "", sample_name: "", reviewer: "" });
  const [downloading, setDownloading] = useState<"xlsx" | "docx" | null>(null);

  useEffect(() => {
    getHealth()
      .then((h) => setConnection(h.api_key_loaded ? "key_loaded" : "dry_run"))
      .catch(() => setConnection("disconnected"));
    getLimits()
      .then((res) => {
        setLimitRows(res.rows);
        setLimitSource(res.source);
      })
      .catch(() => push("Limit 테이블을 불러오지 못했습니다.", "error"));
  }, [push]);

  const step2Locked = ocrRows.length === 0;
  const step3Locked = judge === null;
  const canJudge = ocrRows.some((r) => r.status === "OK");

  const handleRunOcr = async () => {
    setOcrLoading(true);
    try {
      const rows = await runOcr(files);
      setOcrRows(rows);
      setJudge(null);
      setView(2);
    } catch (e) {
      push(e instanceof Error ? e.message : "OCR 실행 실패", "error");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setOcrRows([]);
    setJudge(null);
    setView(1);
  };

  const doJudge = async (cf: number) => {
    setJudgeLoading(true);
    try {
      const res = await runJudge(ocrRows, cf);
      setJudge(res);
      return res;
    } catch (e) {
      push(e instanceof Error ? e.message : "판정 실행 실패", "error");
      return null;
    } finally {
      setJudgeLoading(false);
    }
  };

  const handleRunJudge = () => {
    void doJudge(cfDb);
  };

  const handleCfChange = (v: number) => {
    setCfDb(v);
    if (judge) void doJudge(v);
  };

  const handleLimitSave = async (rows: LimitRow[]) => {
    const res = await putLimits(rows);
    setLimitRows(res.rows);
    setLimitSource(res.source);
    push("Limit 테이블이 저장되었습니다.", "success");
    if (judge) void doJudge(cfDb);
  };

  const handleLimitReset = async () => {
    const res = await resetLimits();
    setLimitRows(res.rows);
    setLimitSource(res.source);
    push("Limit 테이블이 기본값으로 복원되었습니다.", "success");
    if (judge) void doJudge(cfDb);
  };

  const handleDownloadXlsx = async () => {
    if (!judge) return;
    setDownloading("xlsx");
    try {
      const blob = await exportXlsx(judge, cfDb);
      downloadBlob(blob, "re_result.xlsx");
    } catch (e) {
      push(e instanceof Error ? e.message : "Excel 다운로드 실패", "error");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadDocx = async () => {
    if (!judge) return;
    setDownloading("docx");
    try {
      const blob = await exportDocx(judge, cfDb, meta);
      downloadBlob(blob, "re_report.docx");
    } catch (e) {
      push(e instanceof Error ? e.message : "보고서 다운로드 실패", "error");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <AppHeader step={view} connection={connection} />
      <main
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--space-lg)",
        }}
      >
        <nav style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            className={view === 1 ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setView(1)}
          >
            STEP 1
          </button>
          <button
            className={view === 2 ? "btn btn-primary" : "btn btn-secondary"}
            disabled={step2Locked}
            onClick={() => setView(2)}
          >
            STEP 2
          </button>
          <button
            className={view === 3 ? "btn btn-primary" : "btn btn-secondary"}
            disabled={step3Locked}
            onClick={() => setView(3)}
          >
            STEP 3
          </button>
        </nav>

        {view === 1 && (
          <Step1Upload
            files={files}
            onFilesChange={setFiles}
            ocrRows={ocrRows}
            loading={ocrLoading}
            onRunOcr={handleRunOcr}
            onReset={handleReset}
          />
        )}

        {view === 2 && (
          <Step2Judge
            locked={step2Locked}
            cfDb={cfDb}
            onCfChange={handleCfChange}
            onOpenLimitEditor={() => setLimitEditorOpen(true)}
            onRunJudge={handleRunJudge}
            canJudge={canJudge}
            loading={judgeLoading}
            judge={judge}
          />
        )}

        {view === 3 && (
          <Step3Report
            locked={step3Locked}
            meta={meta}
            onMetaChange={setMeta}
            onDownloadXlsx={handleDownloadXlsx}
            onDownloadDocx={handleDownloadDocx}
            downloading={downloading}
          />
        )}
      </main>

      <LimitEditorModal
        open={limitEditorOpen}
        rows={limitRows}
        source={limitSource}
        onClose={() => setLimitEditorOpen(false)}
        onSave={handleLimitSave}
        onReset={handleLimitReset}
      />
    </div>
  );
}
