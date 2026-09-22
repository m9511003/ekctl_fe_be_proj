import { useRef, useState } from "react";
import type { DragEvent } from "react";

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function ImageUploadSection({ files, onFilesChange }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type === "image/png" || f.type === "image/jpeg");
    onFilesChange([...files, ...images]);
  };

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  return (
    <section className="card">
      <h3 style={{ marginBottom: 20 }}>
        <span style={{ color: "var(--color-primary)" }}>2.</span> 이미지 업로드
      </h3>

      <div
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-neutral-300)"}`,
          borderRadius: "var(--radius-lg)",
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: dragOver ? "var(--color-primary-container)" : "transparent",
          cursor: "pointer",
        }}
      >
        <p style={{ margin: 0, color: "var(--color-neutral-500)" }}>
          이미지를 드래그하거나 클릭해서 선택하세요 (png, jpg 등, 다중 선택 가능)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {files.map((f) => (
            <span key={f.name} className="badge badge-neutral" style={{ gap: 6, paddingRight: 6 }}>
              {f.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(f.name);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-neutral-500)",
                  cursor: "pointer",
                  fontSize: 12,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
