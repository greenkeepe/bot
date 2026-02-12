# Avvia il Motore Backend
Start-Process powershell -ArgumentList "cd engine; .\venv\Scripts\activate; python main.py" -WindowStyle Normal

# Avvia la Dashboard Frontend
Start-Process powershell -ArgumentList "cd web-dashboard; npm run dev" -WindowStyle Normal

Write-Host "Nexus Bot avviato! Dashboard disponibile su http://localhost:3000" -ForegroundColor Cyan
