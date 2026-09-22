# Task-001 : 스캐폴드 + UI 구조 + 연동 테스트

> 기반 문서 : `module_1/docs/PRD.md` (v3), `.claude/DESIGN.md`
> 원칙 : UI-First — 라우팅/구조부터 구체화 후 FE·BE·DB 연동 테스트

---

## Phase-01. 프로젝트 스캐폴드

- ✅ `module_1/project/frontend` : Vite + TS 프로젝트 생성
- ✅ `module_1/project/backend` : Python FastAPI 프로젝트 생성 (가상환경 포함)
- ✅ `module_1/project/output` : 산출물(xlsx/docx) 기본 저장 폴더 생성
- ✅ BE 폴더 구조 : `main.py`, `routers/`, `services/`(ocr, judge, export), `models/`, `limits.json`(런타임 생성)
- ✅ FE 폴더 구조 : `src/pages`(또는 steps), `src/components`, `src/api`, `src/types`
- ✅ `.gitignore` : `node_modules`, `__pycache__`, `.venv`, `.env`, `project/output/*` 등록

## Phase-02. 환경변수 및 API Key 안내

- ✅ `module_1/project/backend/.env.example` 생성 : `OPENAI_API_KEY=`
- ✅ `module_1/project/backend/.env` 생성 (빈 값) — 사용자에게 Key 채워넣기 안내 필요
- ✅ 기본 모델 상수화 : `gpt-5.6-luna` (OCR 서비스 모듈 내 상수)
- ✅ **[필수 선행]** 코드 작성 전 최신 OpenAI Vision API 문법(파라미터, JSON 스키마 강제 방식) 확인

## Phase-03. BE 스캐폴드 및 헬스체크

- ✅ FastAPI 앱 초기화 + CORS 설정 (FE 개발 서버 오리진 허용)
- ✅ `GET /api/health` 구현 : `{status:"ok", api_key_loaded: bool}`
- ✅ `limits.json` 미존재 시 PRD §3.1 기본값으로 초기 로드하는 로직 스텁
- ✅ 서버 기동 테스트 (uvicorn) : `/api/health` 200 응답 확인

## Phase-04. FE 스캐폴드 및 라우팅/구조

- ✅ Vite+TS 프로젝트 라이브러리 설치 (라우팅 필요 시 react-router 등, 상태관리는 자유)
- ✅ 3단계 워크플로 화면 구조 스캐폴드 (F6 기준)
  - 헤더 : 타이틀 · 단계 안내 · 백엔드 연결 상태 배지
  - STEP 1 : 파일 업로더 영역 · 결과 표 영역 (틀만)
  - STEP 2 : CF 입력 · Limit 설정 버튼 · KPI 4타일 · 결과 표 (틀만)
  - STEP 3 : 메타 입력 · 다운로드 버튼 2종 (틀만)
- ✅ 단계 잠금/해제 상태값 설계 (STEP2/STEP3 초기 잠금 상태 UI로 표현)
- ✅ `.claude/DESIGN.md` 색상·타이포그래피 토큰 반영 (CSS 변수 or 테마 파일)

## Phase-05. FE↔BE↔DB 연동 테스트

- ✅ FE에서 `GET /api/health` 호출 → 헤더의 백엔드 연결 상태 배지에 반영 (Key 로드 여부 표시)
- ✅ CORS 정상 동작 확인 (FE 개발 서버 → BE 간 실제 브라우저 요청)
- ✅ OpenAI Vision API 최소 호출 테스트 (BE 단독, 샘플 이미지 1장으로 dry 호출 — 네트워크/CORS 이슈 없는지만 확인, 본 기능 구현은 Task-002)
- ✅ `limits.json` 파일 생성 확인 (BE 최초 기동 시 기본값 4행 저장)
- ✅ 통과 조건 : Key 미설정 시 `api_key_loaded:false` 정상 표시 · FE-BE CORS 오류 없음 · uvicorn/vite 동시 기동 확인
- ✅ **테스트 후 서버 반환** : 점유 중인 vite(5173)·uvicorn 프로세스 종료
