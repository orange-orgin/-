@echo off
chcp 65001 >nul
cd /d "%~dp0server"
echo 正在启动校园点餐共享后端服务 (http://localhost:3000) ...
node server.js
pause
