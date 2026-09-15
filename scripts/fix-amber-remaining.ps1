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

    # Fix remaining amber hex (case insensitive)
    $content = $content -replace '(?i)#F59E0B', '#10b981'
    
    # Fix accent-[#F59E0B] pattern
    $content = $content -replace 'accent-\[#F59E0B\]', 'accent-[#10b981]'
    
    # Fix shadow-amber-500 references
    $content = $content -replace 'shadow-amber-500', 'shadow-brand-500'
    $content = $content -replace 'hover:shadow-amber-500', 'hover:shadow-brand-500'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed additional files"
