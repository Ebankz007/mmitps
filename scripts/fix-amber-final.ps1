$ErrorActionPreference = "SilentlyContinue"

# Specific files that still have amber references
$files = @(
    "C:\BerfamWorks\MMITPS\mmitps\frontend-next\app\admin\cms\pages\[id]\page.tsx",
    "C:\BerfamWorks\MMITPS\mmitps\frontend-next\app\admin\users\[id]\wallet\page.tsx",
    "C:\BerfamWorks\MMITPS\mmitps\frontend-next\app\admin\cms\events\[id]\page.tsx",
    "C:\BerfamWorks\MMITPS\mmitps\frontend-next\app\dashboard\support\blogs\[slug]\page.tsx"
)

$fixed = 0
foreach ($filePath in $files) {
    if (-not (Test-Path $filePath)) { continue }
    
    $content = Get-Content -Path $filePath -Raw
    if (-not $content) { continue }
    $original = $content
    
    # Fix all remaining amber hex (case insensitive)
    $content = $content -replace '(?i)#F59E0B', '#10b981'
    
    # Fix shadow-amber references
    $content = $content -replace 'shadow-amber-500', 'shadow-brand-500'
    $content = $content -replace 'hover:shadow-amber-500', 'hover:shadow-brand-500'
    
    if ($content -ne $original) {
        Set-Content -Path $filePath -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $filePath"
    }
}

Write-Host ""
Write-Host "Fixed $fixed specific files"
