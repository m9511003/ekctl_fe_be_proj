# Task-002 : OCR → 단위 변환 → PASS/FAIL 판정

> 선행 : Task-001 (스캐폴드/연동 완료)
> 대상 기능 : F1(OCR API), F2(OCR), F3(단위 변환), F4(판정), F6의 STEP1·STEP2 UI

---

## Phase-01. OCR API 구현 (F1, F2)

- ✅ `POST /api/ocr` : multipart 이미지 N장 수신
- ⚠️ GPT Vision(`gpt-5.6-luna`) 호출 : JSON 스키마 강제(strict) — temperature 0 미지원(reasoning 모델, 기본값 1 고정) 확인 후 파라미터 제외
- ✅ 추출 필드 4종 한정 : `center_freq_ghz`, `marker_freq_ghz`, `marker_power_uw`, `timestamp`
- ✅ JSON 파싱 실패 시 1회 재질의 → 재실패 시 `status:"OCR_FAIL"`, 나머지 이미지는 계속 처리
- ✅ 응답 형식 : `[{file, center_freq_ghz, marker_freq_ghz, marker_power_uw, timestamp, status}]`
- ✅ Key 미설정 상태 호출 시 400 + 안내 메시지 (서버 크래시 금지)

## Phase-02. OCR 검증 (data/img_1~3.png 기준)

- ✅ img_1 : Mkr1 2.405095 GHz · 641.83 µW · 04:52:32 PM Jan 08, 2025
- ✅ img_2 : Mkr1 2.440095 GHz · 477.12 µW · 05:09:16 PM Jan 08, 2025
- ✅ img_3 : Mkr1 2.480131 GHz · 378.31 µW · 05:14:21 PM Jan 08, 2025
- ✅ 통과 조건 : 3장 모두 `status:"OK"` · 화면 표시값과 일치 (PRD §3.2 참조값 대조)

## Phase-03. 단위 변환 로직 (F3)

- ✅ µW → dBm : `10·log10(µW/1000)`
- ✅ dBm → dBµV : `dBm + 107` (50Ω)
- ✅ dBµV → dBµV/m : `dBµV + CF` (CF 기본 −50.0 dB, 요청 파라미터로 변경 가능)
- ✅ 단위 변환 단위 테스트 : img_1~3 입력 시 중간값(dBm, dBµV/m) 수치 검증

## Phase-04. PASS/FAIL 판정 로직 (F4)

- ✅ `POST /api/judge` : OCR 결과 배열 + `cf_db`(기본 −50.0) 수신
- ✅ Limit 매칭 : 활성 Limit 테이블에서 `freq_min_mhz ≤ f < freq_max_mhz` 행 탐색
- ✅ 마진 계산 : `Limit − 측정값(dBµV/m)`
- ✅ 개별 판정 : 마진≥0 → PASS · <0 → FAIL · 매칭없음 → N/A
- ✅ 종합 판정 : FAIL≥1 → FAIL · 전부 PASS → PASS · N/A 포함 → INCOMPLETE
- ✅ 응답 형식 : `{rows:[...], summary:{total, pass, fail, verdict}}`
- ✅ 검증 기댓값(§3.1 기본 Limit·CF −50.0 기준)
  - img_1 : 55.07 dBµV/m · 마진 −1.07 → **FAIL**
  - img_2 : 53.79 dBµV/m · 마진 +0.21 → **PASS**
  - img_3 : 52.78 dBµV/m · 마진 +1.22 → **PASS**
  - 종합 : **FAIL** (CF −52.0으로 변경 시 전부 PASS로 재검증)

## Phase-05. STEP1·STEP2 UI 연동

- ✅ STEP1 : 드래그앤드롭 업로더 · 파일 칩 목록 · 초기화 버튼 · OCR 실행 버튼
- ✅ STEP1 결과 표 : 파일명·Center(GHz)·Mkr1 주파수(GHz)·Mkr1 전력(µW)·측정시각·상태 배지(OK/OCR 실패), 읽기 전용
- ✅ STEP2 : CF 입력(기본 −50.0) · 판정 실행 버튼
- ✅ STEP2 KPI 4타일 : 총 건수·PASS·FAIL·종합판정
- ✅ STEP2 결과 표 : 순번·파일명·주파수·측정전력·dBm·dBµV/m·Limit·마진·판정 배지 (FAIL 행 좌측 4px 바)
- ✅ 진행 규칙 : STEP2는 OCR 결과 1건 이상 시 잠금 해제 · 판정 실행 버튼은 OK행 1건 이상일 때만 활성 · 재판독 시 판정 결과 무효화(STEP3 재잠금)
- ✅ 통과 조건 : 업로드→OCR 실행→판정 실행 흐름 정상 · API 실패 시 토스트 표시 · 화면 멈춤 없음
- ✅ **테스트 후 서버 반환** : vite·uvicorn 프로세스 종료
