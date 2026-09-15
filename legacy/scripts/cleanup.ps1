# Kill all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Verify port is clear
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    Write-Host "Warning: Port 5000 still occupied"
    $connections | ForEach-Object {
        $pid = $_.OwningProcess
        Write-Host "Killing PID: $pid"
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Port 5000 is clear"
}
