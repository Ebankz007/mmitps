$ErrorActionPreference = "SilentlyContinue"
$root = "C:\BerfamWorks\MMITPS\mmitps"

# Get all source files excluding node_modules and .next
$files = Get-ChildItem -Path $root -Include "*.tsx","*.ts","*.jsx","*.js","*.css" -Recurse -File | Where-Object {
    $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\\.next" -and $_.FullName -notmatch "\\.agent"
}

Write-Host "Found $($files.Count) source files to process"

$fixed = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if (-not $content) { continue }
    $original = $content

    # Fix amber hex
    $content = $content -replace '#F59E0B', '#10b981'
    $content = $content -replace '#f59e0b', '#10b981'

    # Fix blue hex
    $content = $content -replace '#3B82F6', '#10b981'
    $content = $content -replace '#3b82f6', '#10b981'
    $content = $content -replace '#2563EB', '#059669'
    $content = $content -replace '#2563eb', '#059669'
    $content = $content -replace '#1D4ED8', '#047857'
    $content = $content -replace '#1d4ed8', '#047857'

    # Fix rgba amber
    $content = $content -replace 'rgba\(245,\s*158,\s*11', 'rgba(16, 185, 129'
    $content = $content -replace 'rgba\(245,158,11', 'rgba(16,185,129'

    # Fix rgba blue
    $content = $content -replace 'rgba\(59,\s*130,\s*246', 'rgba(16, 185, 129'
    $content = $content -replace 'rgba\(59,130,246', 'rgba(16,185,129'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed files with color hex replacements"
