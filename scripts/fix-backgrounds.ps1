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

    # Fix hardcoded surface backgrounds
    $content = $content -replace 'bg-\[#0D0D0D\]', 'bg-[#0d0d0d]'
    $content = $content -replace 'bg-\[#0d0d0d\]', 'bg-surface'
    $content = $content -replace 'bg-\[#0D1117\]', 'bg-surface'
    $content = $content -replace 'bg-\[#141414\]', 'bg-surface-2'
    $content = $content -replace 'bg-\[#1A1A1A\]', 'bg-surface-2'
    $content = $content -replace 'bg-\[#1F1F1F\]', 'bg-surface-3'
    $content = $content -replace 'bg-\[#0d0d0d\]', 'bg-surface'
    $content = $content -replace 'bg-\[#141414\]', 'bg-surface-2'
    $content = $content -replace 'bg-\[#1a1a1a\]', 'bg-surface-2'
    $content = $content -replace 'bg-\[#1f1f1f\]', 'bg-surface-3'

    # Fix hardcoded card backgrounds
    $content = $content -replace 'bg-\[#111111\]', 'bg-[#111]'
    $content = $content -replace 'bg-\[#111\]', 'bg-card'

    # Fix hardcoded border colors
    $content = $content -replace 'border-\[#222222\]', 'border-subtle'
    $content = $content -replace 'border-\[#333333\]', 'border-default'
    $content = $content -replace 'border-\[#222\]', 'border-subtle'
    $content = $content -replace 'border-\[#333\]', 'border-default'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed files with background replacements"
