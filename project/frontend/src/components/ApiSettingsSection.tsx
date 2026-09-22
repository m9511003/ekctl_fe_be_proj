import type { ApiSettings } from "../types";

interface Props {
  settings: ApiSettings;
  onChange: (patch: Partial<ApiSettings>) => void;
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, color: "var(--color-neutral-600)", marginBottom: 8 }}>
        {label}
      </div>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", height: 48 }}
      />
    </div>
  );
}

export function ApiSettingsSection({ settings, onChange }: Props) {
  return (
    <section className="card">
      <h3 style={{ marginBottom: 20 }}>
        <span style={{ color: "var(--color-primary)" }}>1.</span> API 설정
      </h3>

      <Field
        label="OpenAI API Key"
        value={settings.apiKey}
        placeholder="sk-..."
        type="password"
        onChange={(v) => onChange({ apiKey: v })}
      />
      <Field label="모델" value={settings.model} onChange={(v) => onChange({ model: v })} />
      <Field
        label="API 엔드포인트"
        value={settings.endpoint}
        onChange={(v) => onChange({ endpoint: v })}
      />

      <div className="callout-info">
        API 키는 브라우저의 로컬 저장소(localStorage)에만 저장되며 서버로 전송되지 않습니다.
        브라우저에서 직접 OpenAI API를 호출하므로 <strong>CORS 정책</strong>에 따라 요청이 차단될
        수 있습니다. 차단되는 경우 사내 프록시 서버를 통해 호출하도록 엔드포인트를 변경하세요.
      </div>
    </section>
  );
}
