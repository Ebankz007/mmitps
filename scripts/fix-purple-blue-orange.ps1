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

    # Fix purple/indigo hex values
    $content = $content -replace '(?i)#8B5CF6', '#10b981'
    $content = $content -replace '(?i)#7C3AED', '#059669'
    $content = $content -replace '(?i)#6366F1', '#10b981'
    $content = $content -replace '(?i)#6366f1', '#10b981'
    $content = $content -replace '(?i)#5B21B6', '#047857'
    $content = $content -replace '(?i)#4C1D95', '#064e3b'
    $content = $content -replace '(?i)#9333EA', '#10b981'

    # Fix purple/indigo Tailwind classes
    $content = $content -replace 'purple-500', 'brand-500'
    $content = $content -replace 'purple-400', 'brand-400'
    $content = $content -replace 'purple-600', 'brand-600'
    $content = $content -replace 'purple-700', 'brand-700'
    $content = $content -replace 'purple-500/10', 'brand-500/10'
    $content = $content -replace 'purple-500/20', 'brand-500/20'
    $content = $content -replace 'purple-400', 'brand-400'
    $content = $content -replace 'indigo-500', 'brand-500'
    $content = $content -replace 'indigo-400', 'brand-400'
    $content = $content -replace 'indigo-600', 'brand-600'
    $content = $content -replace 'indigo-500/5', 'brand-500/5'
    $content = $content -replace 'indigo-500/10', 'brand-500/10'
    $content = $content -replace 'indigo-500/20', 'brand-500/20'
    $content = $content -replace 'violet-500', 'brand-500'
    $content = $content -replace 'violet-400', 'brand-400'

    # Fix blue CTA classes (buttons, primary actions)
    $content = $content -replace 'bg-blue-600', 'bg-brand-600'
    $content = $content -replace 'bg-blue-500', 'bg-brand-500'
    $content = $content -replace 'hover:bg-blue-500', 'hover:bg-brand-500'
    $content = $content -replace 'hover:bg-blue-600', 'hover:bg-brand-600'
    $content = $content -replace 'hover:bg-blue-400', 'hover:bg-brand-400'
    $content = $content -replace 'text-blue-500', 'text-brand-500'
    $content = $content -replace 'text-blue-400', 'text-brand-400'
    $content = $content -replace 'text-blue-600', 'text-brand-600'
    $content = $content -replace 'border-blue-500', 'border-brand-500'
    $content = $content -replace 'border-blue-500/50', 'border-brand-500/50'
    $content = $content -replace 'border-blue-500/20', 'border-brand-500/20'
    $content = $content -replace 'border-blue-500/10', 'border-brand-500/10'
    $content = $content -replace 'border-blue-500/30', 'border-brand-500/30'
    $content = $content -replace 'border-blue-500/40', 'border-brand-500/40'
    $content = $content -replace 'border-blue-500/5', 'border-brand-500/5'
    $content = $content -replace 'border-t-blue-500', 'border-t-brand-500'
    $content = $content -replace 'border-b-blue-500', 'border-b-brand-500'
    $content = $content -replace 'border-l-blue-500', 'border-l-brand-500'
    $content = $content -replace 'ring-blue-500', 'ring-brand-500'
    $content = $content -replace 'ring-blue-500/50', 'ring-brand-500/50'
    $content = $content -replace 'shadow-blue-500', 'shadow-brand-500'
    $content = $content -replace 'shadow-blue-500/10', 'shadow-brand-500/10'
    $content = $content -replace 'shadow-blue-500/20', 'shadow-brand-500/20'
    $content = $content -replace 'from-blue-500', 'from-brand-500'
    $content = $content -replace 'to-blue-500', 'to-brand-500'
    $content = $content -replace 'to-blue-600', 'to-brand-600'
    $content = $content -replace 'via-blue-400', 'via-brand-400'
    $content = $content -replace 'from-blue-500/10', 'from-brand-500/10'
    $content = $content -replace 'from-blue-500/20', 'from-brand-500/20'
    $content = $content -replace 'to-blue-600/10', 'to-brand-600/10'
    $content = $content -replace 'bg-blue-500/5', 'bg-brand-500/5'
    $content = $content -replace 'bg-blue-500/10', 'bg-brand-500/10'
    $content = $content -replace 'bg-blue-500/20', 'bg-brand-500/20'
    $content = $content -replace 'bg-blue-400/10', 'bg-brand-400/10'
    $content = $content -replace 'bg-blue-600/5', 'bg-brand-600/5'
    $content = $content -replace 'bg-blue-600/30', 'bg-brand-600/30'
    $content = $content -replace 'hover:border-blue-500/30', 'hover:border-brand-500/30'

    # Fix orange classes
    $content = $content -replace 'bg-orange-500', 'bg-brand-500'
    $content = $content -replace 'bg-orange-600', 'bg-brand-600'
    $content = $content -replace 'hover:bg-orange-500', 'hover:bg-brand-500'
    $content = $content -replace 'hover:bg-orange-600', 'hover:bg-brand-600'
    $content = $content -replace 'text-orange-500', 'text-brand-500'
    $content = $content -replace 'text-orange-400', 'text-brand-400'
    $content = $content -replace 'from-orange-500', 'from-brand-500'
    $content = $content -replace 'to-orange-500', 'to-brand-500'

    # Fix #ff9f0a (Apple system orange in NewsCalendar)
    $content = $content -replace '(?i)#ff9f0a', '#10b981'
    $content = $content -replace '(?i)#FF9F0A', '#10b981'

    # Fix #1e4edb (custom blue)
    $content = $content -replace '(?i)#1e4edb', '#059669'

    # Fix cyan-500/600 used with blue
    $content = $content -replace 'from-cyan-500', 'from-brand-400'
    $content = $content -replace 'to-cyan-500', 'to-brand-400'
    $content = $content -replace 'from-cyan-600', 'from-brand-500'
    $content = $content -replace 'to-cyan-600', 'to-brand-500'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed files with color replacements"
