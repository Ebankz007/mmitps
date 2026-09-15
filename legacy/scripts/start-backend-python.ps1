# MMITPS Intelligence Pro Max - Backend Startup Script
# Simplified version to avoid PowerShell parser issues

Write-Host "🚀 Initializing Multi-Asset Intelligence Engine..." -ForegroundColor Cyan

$backendDir = "c:\Berido Projects\Project\MMITPS\mmitps\backend-python"
cd $backendDir

# Create venv if missing
if (!(Test-Path venv)) { python -m venv venv }

# Activate and Run
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
