import { useState } from "react";
import { ApiSettingsSection } from "./components/ApiSettingsSection";
import { ImageUploadSection } from "./components/ImageUploadSection";
import { OcrResultSection } from "./components/OcrResultSection";
import { CsvDownloadSection } from "./components/CsvDownloadSection";
import { useToast } from "./components/Toast";
import { loadSettings, saveSettings } from "./lib/settings";
import { extractOne, OcrError } from "./lib/ocrClient";
import { downloadCsv } from "./lib/csv";
import type { ApiSettings, TestReportRow } from "./types";

export default function App() {
  const { push } = useToast();

  const [settings, setSettings] = useState<ApiSettings>(() => loadSettings());
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<TestReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const updateSettings = (patch: Partial<ApiSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const handleExtractAll = async () => {
    if (!settings.apiKey) {
      push("OpenAI API Key를 입력하세요.", "error");
      return;
    }
    if (files.length === 0) {
      push("업로드된 이미지가 없습니다.", "error");
      return;
    }

    setLoading(true);
    setRows([]);
    setProgress({ done: 0, total: files.length });

    const results: TestReportRow[] = [];
    for (const file of files) {
      try {
        const row = await extractOne(file, settings);
        results.push(row);
      } catch (err) {
        if (err instanceof OcrError) {
          results.push(err.row);
        } else {
          push(err instanceof Error ? err.message : "OCR 추출 실패", "error");
        }
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      setRows([...results]);
    }

    setLoading(false);
  };

  const handleResetAll = () => {
    setFiles([]);
    setRows([]);
    setProgress(null);
  };

  const handleDownloadCsv = () => {
    if (rows.length === 0) {
      push("다운로드할 데이터가 없습니다.", "error");
      return;
    }
    downloadCsv(rows);
  };

  return (
    <div
      className="page"
      style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--space-xl)" }}
    >
      <h1>시험성적서 데이터 추출 OCR</h1>
      <p style={{ color: "var(--color-neutral-600)", marginTop: 8, marginBottom: 32 }}>
        이미지(png/jpg) 기반 시험성적서를 업로드하면 GPT API로 OCR 추출 후 CSV로 저장합니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <ApiSettingsSection settings={settings} onChange={updateSettings} />
        <ImageUploadSection files={files} onFilesChange={setFiles} />
        <OcrResultSection
          rows={rows}
          loading={loading}
          progress={progress}
          onExtractAll={handleExtractAll}
          onResetAll={handleResetAll}
        />
        <CsvDownloadSection onDownload={handleDownloadCsv} />
      </div>
    </div>
  );
}
