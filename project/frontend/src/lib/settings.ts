import type { ApiSettings } from "../types";

const STORAGE_KEY = "quest_ocr_api_settings";

export const DEFAULT_SETTINGS: ApiSettings = {
  apiKey: "",
  model: "gpt-5.6-luna",
  endpoint: "https://api.openai.com/v1/chat/completions",
};

export function loadSettings(): ApiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ApiSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage 접근 불가 시(프라이빗 모드 등) 조용히 무시 — 세션 내 상태로만 동작
  }
}
