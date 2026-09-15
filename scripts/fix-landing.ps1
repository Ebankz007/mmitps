$ErrorActionPreference = "SilentlyContinue"
$root = "C:\BerfamWorks\MMITPS\mmitps\frontend-next\app"

# Landing page and marketing pages that use bg-[#000000]
$files = @(
    "$root\page.tsx",
    "$root\contact\page.tsx",
    "$root\performance\page.tsx",
    "$root\privacy\page.tsx",
    "$root\terms\page.tsx"
)

$fixed = 0
foreach ($filePath in $files) {
    if (-not (Test-Path $filePath)) { continue }
    
    $content = Get-Content -Path $filePath -Raw
    if (-not $content) { continue }
    $original = $content
    
    # Replace pure black bg with charcoal dark theme
    $content = $content -replace 'bg-\[#000000\]', 'bg-[#0d0d0d]'
    
    if ($content -ne $original) {
        Set-Content -Path $filePath -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $filePath"
    }
}

Write-Host ""
Write-Host "Fixed $fixed landing/marketing pages"
