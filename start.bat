@echo off
echo ====================================================================
echo Starting AI-Based Internship Finder & Recommendation System
echo ====================================================================

cd /d "%~dp0"

echo [1/2] Starting AI Python NLP Engine on port 8000...
start "AI NLP Engine (Port 8000)" cmd /k "python ai-service\server.py"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Full-Stack Web Server on port 5000...
start "Web Server & API (Port 5000)" cmd /k "node server\server.js"

timeout /t 2 /nobreak >nul

echo.
echo ====================================================================
echo Web application is running!
echo Open your browser at: http://localhost:5000
echo ====================================================================
start http://localhost:5000
