import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  kind: "error" | "success" | "info";
}

interface ToastContextValue {
  push: (message: string, kind?: ToastItem["kind"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, kind: ToastItem["kind"] = "error") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 1000,
        }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="card"
            style={{
              minWidth: 260,
              padding: "12px 16px",
              borderLeft: `4px solid ${
                t.kind === "error"
                  ? "var(--color-fail)"
                  : t.kind === "success"
                    ? "var(--color-pass)"
                    : "var(--color-info)"
              }`,
              fontSize: 14,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
