import type { ApiSettings, TestReportRow } from "../types";

const PROMPT =
  "첨부된 시험성적서 이미지에서 다음 8개 항목만 추출하세요: 시료명, 시험항목, 측정값, " +
  "기준값(Limit), 단위, 판정, 시험기관, 시험일자. 이미지에 실제 표시된 값만 사용하고, " +
  "지정된 JSON 스키마로만 응답하세요.";

const SCHEMA = {
  name: "test_report_reading",
  schema: {
    type: "object",
    properties: {
      sample_name: { type: "string" },
      test_item: { type: "string" },
      measured_value: { type: "string" },
      limit_value: { type: "string" },
      unit: { type: "string" },
      verdict: { type: "string" },
      test_org: { type: "string" },
      test_date: { type: "string" },
    },
    required: [
      "sample_name",
      "test_item",
      "measured_value",
      "limit_value",
      "unit",
      "verdict",
      "test_org",
      "test_date",
    ],
    additionalProperties: false,
  },
  strict: true,
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function failRow(filename: string): TestReportRow {
  return {
    file: filename,
    sample_name: null,
    test_item: null,
    measured_value: null,
    limit_value: null,
    unit: null,
    verdict: null,
    test_org: null,
    test_date: null,
    status: "OCR_FAIL",
  };
}

export async function extractOne(file: File, settings: ApiSettings): Promise<TestReportRow> {
  if (!settings.apiKey) {
    throw new Error("OpenAI API Key가 입력되지 않았습니다.");
  }

  const dataUrl = await fileToDataUrl(file);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(settings.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: PROMPT },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          response_format: { type: "json_schema", json_schema: SCHEMA },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        file: file.name,
        sample_name: parsed.sample_name,
        test_item: parsed.test_item,
        measured_value: parsed.measured_value,
        limit_value: parsed.limit_value,
        unit: parsed.unit,
        verdict: parsed.verdict,
        test_org: parsed.test_org,
        test_date: parsed.test_date,
        status: "OK",
      };
    } catch (err) {
      if (attempt === 0) continue; // JSON 파싱 등 실패 시 1회 재질의
      const message = err instanceof Error ? err.message : String(err);
      const row = failRow(file.name);
      throw new OcrError(message, row);
    }
  }

  return failRow(file.name);
}

export class OcrError extends Error {
  row: TestReportRow;
  constructor(message: string, row: TestReportRow) {
    super(message);
    this.row = row;
  }
}
