@echo off
start "QUEST Backend" cmd /k "%~dp0run_backend.bat"
start "QUEST Frontend" cmd /k "%~dp0run_frontend.bat"
