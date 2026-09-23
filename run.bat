@echo off
title SkillSync Master Launcher
echo ========================================================
echo   Launching SkillSync Full Stack (Backend + Mobile)
echo ========================================================

echo [1/2] Launching NestJS Backend API (Port 3000)...
start "SkillSync Backend API" cmd /k "cd /d %~dp0backend && npm run start:dev"

echo [2/2] Launching React Native Android App...
start "SkillSync Mobile App" cmd /k "cd /d %~dp0mobile && npm run android"

echo ========================================================
echo   Both services are now running in dedicated windows!
echo   * Backend API:  http://localhost:3000/api/v1
echo   * Swagger Docs: http://localhost:3000/api/docs
echo   * Emulator:     Connecting via 10.0.2.2:3000
echo ========================================================
