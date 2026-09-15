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

    # === TEXT COLOR REPLACEMENTS ===
    # text-white/20 → text-[var(--color-text-muted)]
    $content = $content -replace 'text-white/20\b', 'text-[var(--color-text-muted)]'
    $content = $content -replace 'text-white/25\b', 'text-[var(--color-text-muted)]'

    # text-white/30 → text-[var(--color-text-muted)]
    $content = $content -replace 'text-white/30\b', 'text-[var(--color-text-muted)]'

    # text-white/40 → text-[var(--color-text-secondary)]
    $content = $content -replace 'text-white/40\b', 'text-[var(--color-text-secondary)]'

    # text-white/50 → text-[var(--color-text-secondary)]
    $content = $content -replace 'text-white/50\b', 'text-[var(--color-text-secondary)]'

    # text-white/60 → text-[var(--color-text-secondary)]
    $content = $content -replace 'text-white/60\b', 'text-[var(--color-text-secondary)]'

    # text-white/70 → text-[var(--color-text-secondary)]
    $content = $content -replace 'text-white/70\b', 'text-[var(--color-text-secondary)]'

    # text-white/80 → text-[var(--color-text-primary)]
    $content = $content -replace 'text-white/80\b', 'text-[var(--color-text-primary)]'

    # text-white/90 → text-[var(--color-text-primary)]
    $content = $content -replace 'text-white/90\b', 'text-[var(--color-text-primary)]'

    # text-white (standalone, not already replaced) → text-[var(--color-text-primary)]
    # Only replace text-white that isn't followed by / (to avoid double-replacing)
    $content = $content -replace 'text-white(?![/\w])', 'text-[var(--color-text-primary)]'

    # === BG COLOR REPLACEMENTS ===
    # bg-white/5 → bg-[var(--color-surface-2)]
    $content = $content -replace 'bg-white/5\b', 'bg-[var(--color-surface-2)]'
    $content = $content -replace 'bg-white/8\b', 'bg-[var(--color-surface-2)]'

    # bg-white/10 → bg-[var(--color-surface-3)]
    $content = $content -replace 'bg-white/10\b', 'bg-[var(--color-surface-3)]'

    # bg-white/20 → bg-[var(--color-surface-3)]
    $content = $content -replace 'bg-white/20\b', 'bg-[var(--color-surface-3)]'

    # bg-white (standalone) → bg-surface
    $content = $content -replace 'bg-white(?![/\w])', 'bg-surface'

    # === BORDER COLOR REPLACEMENTS ===
    # border-white/5 → border-[var(--color-border)]
    $content = $content -replace 'border-white/5\b', 'border-[var(--color-border)]'

    # border-white/8 → border-[var(--color-border)]
    $content = $content -replace 'border-white/8\b', 'border-[var(--color-border)]'

    # border-white/10 → border-[var(--color-border)]
    $content = $content -replace 'border-white/10\b', 'border-[var(--color-border)]'

    # border-white/20 → border-[var(--color-border-hover)]
    $content = $content -replace 'border-white/20\b', 'border-[var(--color-border-hover)]'

    # border-white (standalone) → border-[var(--color-border-hover)]
    $content = $content -replace 'border-white(?![/\w])', 'border-[var(--color-border-hover)]'

    # === RING/SHADOW COLOR REPLACEMENTS ===
    # ring-white/10 → ring-[var(--color-border)]
    $content = $content -replace 'ring-white/10\b', 'ring-[var(--color-border)]'
    $content = $content -replace 'ring-white/20\b', 'ring-[var(--color-border-hover)]'

    # === DIVIDER/SEPARATOR COLORS ===
    $content = $content -replace 'divide-white/10\b', 'divide-[var(--color-border)]'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixed++
        Write-Host "  Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Fixed $fixed files with text/border/bg replacements"
