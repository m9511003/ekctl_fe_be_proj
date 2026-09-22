# Task-004 : 통합 테스트, 예외 처리, 배치 스크립트

> 선행 : Task-001~003 (전체 기능 구현 완료)
> 목적 : 전체 워크플로 E2E 검증 · 예외 케이스 방어 · 실행 편의성 확보

---

## Phase-01. 전체 워크플로 E2E 테스트

- ✅ 로컬 개발 서버 접속 → 업로드 → OCR 실행 → 판정 실행 → 메타 입력 → 다운로드 2종 정상 흐름 확인
- ✅ img_1~3 + 기본 Limit(§3.1) + 기본 CF(−50.0) → **FAIL 1 · PASS 2 · 종합 FAIL** 확인
- ✅ CF −52.0으로 변경 → 전부 PASS로 재판정 확인 (OCR API 재호출 0회, 네트워크 탭 확인)
- ✅ OCR 전 STEP2·3 잠금, 판정 전 STEP3 잠금 확인
- ✅ 재판독(OCR 재실행) 시 이전 판정 결과 초기화 확인
- ✅ 초기화 버튼 → 파일·OCR 결과·판정 결과 전체 리셋, STEP2·3 재잠금 확인

## Phase-02. 예외 처리 검증

- ✅ Key 미설정 상태 : `/api/health` → `api_key_loaded:false` · `/api/ocr` 호출 시 400 + 안내 메시지(크래시 없음)
- ✅ OCR 실패 케이스 : JSON 파싱 실패 1회 재질의 후 `status:"OCR_FAIL"` 처리, 나머지 이미지 계속 처리 확인
- ✅ Limit 저장 실패 케이스 : 하한≥상한, 구간 중복 입력 시 400 + 위반 행 번호·사유, 기존 테이블 미변경
- ✅ API 호출 실패 시 토스트 표시, 화면 멈춤 없음 확인
- ✅ 빈 상태·로딩(진행바+단계 라벨)·오류(토스트) 3종 UI 상태 확인

## Phase-03. UI 폴리싱 (Design.md 반영)

- ✅ 색상 토큰(primary, pass/fail/warn 등) 및 타이포그래피(SUIT/Poppins/Montserrat) 적용 확인
- ✅ 판정 색상 : 색상 + 텍스트 라벨 병기 (색상 단독 사용 금지, Design.md Don't 항목)
- ✅ KPI 타일, Result Table(FAIL 행 좌측 4px 바), Badge 컴포넌트 스타일 확인
- ✅ 반응형 브레이크포인트(768/992/1200/1600px) 확인
- ✅ 타입/린트 검사 오류 0건, 프로덕션 빌드 에러 0건 확인

## Phase-04. 최종 산출물 검증

- ✅ `re_result.xlsx` : 컬럼 순서·각주(`※ CF = {cf} dB 가정치 적용`) 확인
- ✅ `re_report.docx` : 문서번호(`HCT-RE-{연도}-0001`) · 규격표기(`FCC Part 15 Subpart B Class B (3 m)`) · 특이사항(remarks) 정확성 확인
- ✅ docx 1페이지 · 미치환 `{{` 0건 · 한글 깨짐 0건 · 표 행 수=판정 행 수 재확인
- ✅ `project/output/` 폴더에 산출물 저장 경로 확인

## Phase-05. 배치 스크립트 및 서버 실행 문서화

- ✅ `module_1/project/run_backend.bat` : venv 활성화 + uvicorn 실행 (CRLF 유지)
- ✅ `module_1/project/run_frontend.bat` : npm install(최초 1회) + vite dev 실행 (CRLF 유지)
- ✅ `module_1/project/run_all.bat` (선택) : FE+BE 동시 기동
- ✅ 배치 스크립트 실행 테스트 (Windows 환경, CRLF 줄바꿈 확인)
- ✅ 사용자 안내 : `.env` 파일에 `OPENAI_API_KEY` 채워넣기 안내 문구 포함
- ✅ **테스트 후 서버 반환** : 모든 테스트 종료 후 vite·uvicorn 프로세스 반드시 종료
