# MMITPS Brand Color Fix Script
# Replaces hardcoded amber (#F59E0B) and blue (#3B82F6) hex values with brand emerald (#10b981)
# Also fixes border radius violations

$ErrorActionPreference = "SilentlyContinue"
$root = "C:\BerfamWorks\MMITPS\mmitps"
$extensions = @("*.tsx", "*.ts", "*.jsx", "*.js", "*.css")

# Files to exclude (node_modules, .next, build artifacts)
$excludePatterns = @("node_modules", ".next", "dist", "build", ".agent")

function Get-TargetFiles {
    param([string]$Path, [string[]]$Extensions)
    $files = @()
    foreach ($ext in $Extensions) {
        $files += Get-ChildItem -Path $Path -Filter $ext -Recurse -File | 
            Where-Object { 
                $ fullPath = $_.FullName
                $excludePatterns | ForEach-Object { if ($fullPath -match $_) { return $false } }
                return $true
            }
    }
    return $files
}

Write-Host "=== MMITPS Brand Color Fix ===" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# PART 1: Fix Hardcoded Amber Hex Values
# ═══════════════════════════════════════════════════════════════
Write-Host "[1/4] Fixing hardcoded amber hex values..." -ForegroundColor Yellow

$files = Get-TargetFiles -Path $root -Extensions $extensions
$amberFixed = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    
    # Replace #F59E0B (uppercase) with brand emerald
    $content = $content -replace '#F59E0B', '#10b981'
    # Replace #f59e0b (lowercase) with brand emerald
    $content = $content -replace '#f59e0b', '#10b981'
    
    # Replace rgba(245, 158, 11, ...) with brand emerald rgba
    $content = $content -replace 'rgba\(245,\s*158,\s*11', 'rgba(16, 185, 129'
    # Replace rgb(245, 158, 11) with brand emerald rgb
    $content = $content -replace 'rgb\(245,\s*158,\s*11\)', 'rgb(16, 185, 129)'
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $amberFixed++
        Write-Host "  Fixed amber in: $($file.FullName.Replace($root, ''))" -ForegroundColor DarkGray
    }
}

Write-Host "  Amber hex fixes applied to $amberFixed files" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# PART 2: Fix Hardcoded Blue Hex Values
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "[2/4] Fixing hardcoded blue hex values..." -ForegroundColor Yellow

$files = Get-TargetFiles -Path $root -Extensions $extensions
$blueFixed = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    
    # Replace #3B82F6 / #3b82f6 (blue-500) with brand emerald
    $content = $content -replace '#3B82F6', '#10b981'
    $content = $content -replace '#3b82f6', '#10b981'
    
    # Replace #2563EB / #2563eb (blue-600) with brand-600
    $content = $content -replace '#2563EB', '#059669'
    $content = $content -replace '#2563eb', '#059669'
    
    # Replace #1D4ED8 / #1d4ed8 (blue-700) with brand-700
    $content = $content -replace '#1D4ED8', '#047857'
    $content = $content -replace '#1d4ed8', '#047857'
    
    # Replace rgba(59, 130, 246, ...) with brand emerald rgba
    $content = $content -replace 'rgba\(59,\s*130,\s*246', 'rgba(16, 185, 129'
    # Replace rgb(59, 130, 246) with brand emerald rgb
    $content = $content -replace 'rgb\(59,\s*130,\s*246\)', 'rgb(16, 185, 129)'
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $blueFixed++
        Write-Host "  Fixed blue in: $($file.FullName.Replace($root, ''))" -ForegroundColor DarkGray
    }
}

Write-Host "  Blue hex fixes applied to $blueFixed files" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# PART 3: Fix Brand Shadows (amber rgba in shadows)
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "[3/4] Fixing brand shadow references..." -ForegroundColor Yellow

$files = Get-TargetFiles -Path $root -Extensions $extensions
$shadowFixed = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    
    # Fix tailwind.config.ts shadow definitions
    $content = $content -replace 'rgba\(245,158,11', 'rgba(16,185,129'
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $shadowFixed++
        Write-Host "  Fixed shadows in: $($file.FullName.Replace($root, ''))" -ForegroundColor DarkGray
    }
}

Write-Host "  Shadow fixes applied to $shadowFixed files" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# PART 4: Fix Border Radius Violations
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "[4/4] Fixing border radius violations..." -ForegroundColor Yellow

$files = Get-TargetFiles -Path $root -Extensions $extensions
$radiusFixed = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    
    # Replace large border radius values with design system max (rounded-lg = 6px)
    # Custom arbitrary values
    $content = $content -replace 'rounded-\[2\.5rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[3rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[2rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[40px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[32px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[24px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[1\.5rem\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[20px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[16px\]', 'rounded-lg'
    $content = $content -replace 'rounded-\[12px\]', 'rounded-md'
    $content = $content -replace 'rounded-\[10px\]', 'rounded-md'
    $content = $content -replace 'rounded-\[8px\]', 'rounded-md'
    $content = $content -replace 'rounded-\[7px\]', 'rounded-md'
    
    # Replace Tailwind large radius classes
    $content = $content -replace 'rounded-3xl', 'rounded-lg'
    $content = $content -replace 'rounded-2xl', 'rounded-lg'
    $content = $content -replace 'rounded-xl', 'rounded-lg'
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $radiusFixed++
        Write-Host "  Fixed radius in: $($file.FullName.Replace($root, ''))" -ForegroundColor DarkGray
    }
}

Write-Host "  Border radius fixes applied to $radiusFixed files" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Cyan
Write-Host "  Amber hex fixes: $amberFixed files" -ForegroundColor White
Write-Host "  Blue hex fixes: $blueFixed files" -ForegroundColor White
Write-Host "  Shadow fixes: $shadowFixed files" -ForegroundColor White
Write-Host "  Border radius fixes: $radiusFixed files" -ForegroundColor White
Write-Host ""
Write-Host "Total files modified: $($amberFixed + $blueFixed + $shadowFixed + $radiusFixed)" -ForegroundColor Green
