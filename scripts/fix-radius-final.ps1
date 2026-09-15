$ErrorActionPreference = "SilentlyContinue"
$root = "C:\BerfamWorks\MMITPS\mmitps"

$files = Get-ChildItem -Path $root -Include "*.tsx","*.ts","*.jsx","*.js","*.css" -Recurse -File | Where-Object {
    $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\\.next" -and $_.FullName -notmatch "\\.agent"
}

Write-Host "Found $($files.Count) source files to process"

$fixed = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if (-not $content) { continue }
    $original = $content

    # Fix remaining large border radius values
    $content = $content -replace 'rounded-\[2\.5rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[3rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[2rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[40px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[32px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[24px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[1\.5rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[20px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[16px\]', 'rounded-lg'
    
    # Fix remaining Tailwind large radius classes
    $content = $content -replace 'rounded-3xl', 'rounded-lg'
    $content = $content -replace 'rounded-2xl', 'rounded-lg'
    $content = $content -replace 'rounded-xl', 'rounded-lg'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed additional files with border radius"
