$ErrorActionPreference = "SilentlyContinue"
$root = "C:\BerfamWorks\MMITPS\mmitps\frontend-next"

$files = Get-ChildItem -Path $root -Include "*.tsx","*.ts","*.jsx","*.js" -Recurse -File | Where-Object {
    $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\\.next"
}

$fixed = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if (-not $content) { continue }
    $original = $content

    # Fix oversized border radius values
    $content = $content -replace 'rounded-\[1\.9rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[2rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[48px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[50px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[60px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[80px\]', 'rounded-lg'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed files with border radius"
