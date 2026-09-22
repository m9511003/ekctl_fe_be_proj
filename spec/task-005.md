# Task-005 : 원페이지 클라이언트 전용 OCR 화면으로 재설계

> 배경 : 사용자가 제공한 참조 이미지(범용 시험성적서 OCR 툴)에 맞춰 FE를 전면 재구성.
> **주의** : 본 변경은 PRD.md(§FE↔BE 분리, §API Key는 `.env` 전용) 원칙과 다른 방향이며,
> 사용자가 AskUserQuestion으로 명시적으로 선택한 사항(클라이언트 직접 호출·원페이지·범용 필드).

---

## Phase-01. 아키텍처 변경 사항

- ✅ FE가 BE를 거치지 않고 브라우저에서 OpenAI API를 직접 호출하는 구조로 전환
- ✅ API Key·모델·엔드포인트를 화면에서 입력받아 `localStorage`에 저장(서버 전송 없음)
- ✅ CORS 차단 가능성을 화면 안내 문구로 고지, 엔드포인트를 사용자가 직접 변경 가능하도록 함
- ⚠️ `project/backend`(FastAPI, OCR·판정·Limit·Excel/DOCX API)는 코드 그대로 보존되나 이 화면에서는 미사용 — 추후 재사용 가능성을 위해 삭제하지 않음

## Phase-02. UI 재구성 (3단계 워크플로 → 원페이지)

- ✅ 기존 STEP1(OCR)/STEP2(판정)/STEP3(보고서) 3단계 탭 구조 제거
- ✅ 참조 이미지와 동일한 4개 섹션 세로 배치 : 1.API 설정 / 2.이미지 업로드 / 3.OCR 데이터 추출 / 4.CSV 다운로드
- ✅ 판정(PASS/FAIL) 로직·KPI 타일·Limit 편집 모달·DOCX/Excel 내보내기 UI 제거 (해당 기능 자체가 이번 화면 범위에서 제외됨)
- ✅ 기존 `.claude/DESIGN.md` 색상·카드·버튼·인풋 토큰은 그대로 재사용, 헤더/스텝 네비게이션만 제거

## Phase-03. 데이터 필드 변경 (EMC RE 도메인 → 범용 시험성적서)

- ✅ 필드 교체 : `center_freq_ghz/marker_freq_ghz/marker_power_uw` 등 → `sample_name·test_item·measured_value·limit_value·unit·verdict·test_org·test_date`
- ✅ 결과 표 컬럼 : 파일명·시료명·시험항목·측정값·기준값(Limit)·단위·판정·시험기관·시험일자
- ✅ OCR 실패 시 `status:"OCR_FAIL"` 행은 판정 컬럼에 "OCR 실패" 표시, 나머지 이미지는 계속 처리

## Phase-04. 기능 검증

- ✅ 화면 레이아웃이 참조 이미지와 일치 (헤딩 번호 색상, 카드 순서, 콜아웃 박스, 빈 상태 문구 포함)
- ✅ API Key 미입력 상태로 추출 시도 → 토스트 안내, 크래시 없음
- ✅ 업로드 파일 칩 표시·삭제, 전체 초기화 정상 동작
- ✅ API 설정값이 새로고침 후에도 `localStorage`에서 복원됨
- ✅ CSV 다운로드 : 데이터 없을 때 토스트 안내, 있을 때 UTF-8 BOM 포함 CSV 파일 다운로드
- ✅ 모바일(375px) 가로 스크롤 없음, 콘솔 에러 0건, 프로덕션 빌드 에러 0건
- ✅ **테스트 후 서버 반환** : 서버 종료 완료
