# MMITPS Server Cleanup and Restart Script
# Purpose: Forcefully clear port 5006 and restart the development server

Write-Host "🧹 MMITPS Server Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node.js processes
Write-Host "Step 1: Terminating all Node.js processes..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
    Write-Host "✓ Node.js processes terminated" -ForegroundColor Green
} catch {
    Write-Host "⚠ No Node.js processes found (this is okay)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Wait for processes to fully terminate
Write-Host "Step 2: Waiting for cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "✓ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 3: Verify port 5006 is free
Write-Host "Step 3: Checking port 5006 status..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :5006
if ($portCheck) {
    Write-Host "⚠ Port 5006 is still in use. Attempting to free it..." -ForegroundColor Yellow
    
    # Extract PIDs and kill them
    $portCheck | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            Write-Host "  Killing process $pid..." -ForegroundColor Yellow
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Process $pid terminated" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠ Could not terminate process $pid" -ForegroundColor Red
            }
        }
    }
    
    Start-Sleep -Seconds 1
    
    # Verify again
    $portCheckAfter = netstat -ano | findstr :5006
    if ($portCheckAfter) {
        Write-Host "❌ Port 5006 is still in use. Manual intervention required." -ForegroundColor Red
        Write-Host "   Run: netstat -ano | findstr :5006" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "✓ Port 5006 is now free" -ForegroundColor Green
    }
} else {
    Write-Host "✓ Port 5006 is free" -ForegroundColor Green
}
Write-Host ""

# Step 4: Start the development server
Write-Host "Step 4: Starting development server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server when done" -ForegroundColor Cyan
Write-Host ""

npm run dev
