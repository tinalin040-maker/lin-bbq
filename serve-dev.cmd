@echo off
chcp 65001 >nul
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File "%~dp0.claude\serve.ps1"
