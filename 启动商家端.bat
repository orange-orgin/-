@echo off
chcp 65001 >nul
cd /d "%~dp0shop\777"

where node >nul 2>nul
if errorlevel 1 (
  set "PATH=C:\Users\jk\.workbuddy\binaries\node\versions\22.22.2-6;%PATH%"
)

echo 正在启动商家管理后台 (http://localhost:5173) ...
echo 登录账号：shop1 / 123456   或   shop2 / 123456
call npm run dev
pause
