interface Props {
  onDownload: () => void;
}

export function CsvDownloadSection({ onDownload }: Props) {
  return (
    <section className="card">
      <h3 style={{ marginBottom: 20 }}>
        <span style={{ color: "var(--color-primary)" }}>4.</span> CSV 다운로드
      </h3>
      <button className="btn btn-primary" onClick={onDownload}>
        CSV 다운로드
      </button>
    </section>
  );
}
