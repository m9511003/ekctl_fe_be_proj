@echo off
cd /d "%~dp0backend"
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -r requirements.txt -q
if not exist ".env" (
    echo [WARN] backend\.env 파일이 없습니다. .env.example 을 복사한 뒤 OPENAI_API_KEY 를 채워넣으세요.
)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
