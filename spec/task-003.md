# Task-003 : Limit 테이블 관리 + 산출물(Excel/DOCX) 생성

> 선행 : Task-002 (OCR/판정 완료)
> 대상 기능 : F7(Limit 편집), F5(엑셀·보고서 생성), F6의 STEP3 UI

---

## Phase-01. Limit 테이블 API (F7, F1 일부)

- ✅ `GET /api/limits` : `{rows:[{freq_min_mhz, freq_max_mhz, limit_dbuv_m}], source:"default"|"user"}`
- ✅ `PUT /api/limits` : 검증 후 `limits.json` 저장 → `{rows, source:"user"}` · 검증 실패 시 400 + 사유
- ✅ `POST /api/limits/reset` : 기본값(§3.1) 복원 → `{rows, source:"default"}`
- ✅ 검증 규칙 : `freq_min_mhz < freq_max_mhz` · 모두 0 초과 · 구간 중복 금지(정렬 후 저장) · `limit_dbuv_m` 숫자 필수(음수 허용) · 행 0건 저장 금지
- ✅ 위반 시 400 + 위반 행 번호·사유 반환, 기존 테이블 미변경
- ✅ 재기동 후 `PUT` 값 유지 확인 (파일 영속화)

## Phase-02. Limit 편집 UI (F7)

- ✅ 상단 "Limit 설정" 버튼 → 편집 패널(모달/드로어)
- ✅ 현재 활성 행 목록 표시 (구간 하한·구간 상한·Limit) + 출처 배지(기본값|사용자 수정)
- ✅ 행 추가·인라인 수정·행 삭제·기본값 복원 조작
- ✅ 저장 클릭 → `PUT /api/limits` → 성공 토스트 → 결과 표 재판정 반영
- ✅ FE 선검증(BE 규칙과 동일) 후 잘못된 입력은 토스트 오류로 차단
- ✅ 진행 규칙 : CF 변경·Limit 저장 시 이미 판정된 경우에만 자동 재판정, OCR 재호출 금지(기존 OCR 결과 재사용)
- ✅ 통과 조건 : 편집→저장→재판정 시 새 Limit 기준 마진·판정 변경 확인 · 하한≥상한/구간중복 저장 시도 시 토스트 오류·기존값 유지 · 기본값 복원 시 §3.1 상태 복귀

## Phase-03. 엑셀 산출물 생성 (F5)

- ✅ `POST /api/export/xlsx` : judge 응답 수신 → `re_result.xlsx` 바이너리 반환
- ✅ 시트명 `RE_Result`
- ✅ 컬럼 : 순번·파일명·측정주파수(MHz)·측정전력(µW)·측정값(dBm)·측정값(dBµV/m)·Limit(dBµV/m)·마진(dB)·판정
- ✅ 하단 각주 : `※ CF = {cf} dB 가정치 적용`

## Phase-04. DOCX 보고서 생성 (F5)

- ✅ `POST /api/export/docx` : judge 응답 + 메타(`tester`, `sample_name`, `reviewer`) 수신 → `re_report.docx` 반환
- ✅ 템플릿 : `module_1/data/report_template.docx` 사용, `{{key}}` 치환
- ✅ 치환 대상 플레이스홀더 확인됨 : `cf_db`, `doc_no`, `fail_cnt`, `generated_at`, `pass_cnt`, `remarks`, `reviewer`, `sample_name`, `standard`, `test_date`, `test_name`, `tester`, `total`, `verdict`, 행 반복용 `r.no`, `r.freq_mhz`, `r.power_uw`, `r.dbm`, `r.dbuv_m`, `r.limit`, `r.margin`, `r.verdict`
- ✅ 문서번호(`doc_no`) 규칙 : `HCT-RE-{시험일 연도}-0001`
- ✅ `standard` 값 : `FCC Part 15 Subpart B Class B (3 m)`
- ✅ `remarks` 규칙 : FAIL 항목 `{주파수} MHz Limit {초과량} dB 초과` 나열 + 고정 문구 `※ 측정 검출기 RMS(Avg) · Limit 기준 QP — 교육용 참고 판정`
- ✅ 결과 표 행 반복 렌더링 · 맑은 고딕 서식 유지
- ✅ 통과 조건 : docx 1페이지 · 미치환 `{{` 0건 · 한글 깨짐 0건 · 표 행 수 = 판정 행 수

## Phase-05. STEP3 UI 연동

- ✅ 메타 입력 필드 : 담당자(tester)·시료명(sample_name)·검토자(reviewer)
- ✅ Excel 다운로드 · 보고서(DOCX) 다운로드 버튼
- ✅ 진행 규칙 : STEP3는 판정 결과 존재 시 잠금 해제 · 다운로드 버튼은 판정 결과 존재 시에만 활성
- ✅ `.claude/DESIGN.md` Download 컴포넌트 스타일 반영 (Secondary + 산출물 라벨, hover 시 shadow-sm+pass 라벨)
- ✅ 통과 조건 : 메타 입력→Excel/DOCX 다운로드 2종 정상 동작 · 프로덕션 빌드 에러 0건
- ✅ **테스트 후 서버 반환** : vite·uvicorn 프로세스 종료
