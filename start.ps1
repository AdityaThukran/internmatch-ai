Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Starting AI-Based Internship Finder & Recommendation System" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "`n[1/2] Starting AI Python NLP Engine on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python ai-service/server.py"

Start-Sleep -Seconds 2

Write-Host "`n[2/2] Starting Full-Stack Web Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server/server.js"

Start-Sleep -Seconds 2

Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host "App is running! Opening browser at http://localhost:5000" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green

Start-Process "http://localhost:5000"
