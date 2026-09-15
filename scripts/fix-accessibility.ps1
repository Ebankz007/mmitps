$ErrorActionPreference = "SilentlyContinue"
$root = "C:\BerfamWorks\MMITPS\mmitps\frontend-next"

# Fix icon-only buttons in AlertsDialog
$alertsFile = Join-Path $root "components\vmid\AlertsDialog.tsx"
if (Test-Path $alertsFile) {
    $c = Get-Content $alertsFile -Raw
    # Close button at top
    $c = $c -replace '(<button[^>]*onClick=\{[^}]*close\}[^>]*>)\s*(<X\b)', '$1 aria-label="Close dialog" $2'
    # Toggle power button
    $c = $c -replace '(<button[^>]*className="[^"]*text-red-500[^"]*"[^>]*>\s*<Power)', '$1 aria-label="Toggle alert" $2'
    # Delete button
    $c = $c -replace '(<button[^>]*className="[^"]*hover:text-red-500[^"]*"[^>]*>\s*<Trash)', '$1 aria-label="Delete alert" $2'
    Set-Content $alertsFile $c -NoNewline
    Write-Host "  Fixed: AlertsDialog.tsx"
}

# Fix NewsCalendar prev/next buttons
$newsFile = Join-Path $root "components\news\NewsCalendar.tsx"
if (Test-Path $newsFile) {
    $c = Get-Content $newsFile -Raw
    # Previous month button
    $c = $c -replace '(<button[^>]*onClick=\{[^}]*prev[^}]*\}[^>]*>\s*<ChevronLeft)', '$1 aria-label="Previous month" $2'
    # Next month button
    $c = $c -replace '(<button[^>]*onClick=\{[^}]*next[^}]*\}[^>]*>\s*<ChevronRight)', '$1 aria-label="Next month" $2'
    Set-Content $newsFile $c -NoNewline
    Write-Host "  Fixed: NewsCalendar.tsx"
}

# Fix MarketGeometryScanner target button
$geoFile = Join-Path $root "components\trading\MarketGeometryScanner.tsx"
if (Test-Path $geoFile) {
    $c = Get-Content $geoFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*rounded-lg[^"]*"[^>]*>\s*<Target)', '$1 aria-label="Scan for patterns" $2'
    Set-Content $geoFile $c -NoNewline
    Write-Host "  Fixed: MarketGeometryScanner.tsx"
}

# Fix market pages play buttons
$marketPages = @(
    "app\dashboard\markets\forex\page.tsx",
    "app\dashboard\markets\commodities\page.tsx",
    "app\dashboard\markets\crypto\page.tsx",
    "app\dashboard\markets\stocks\page.tsx",
    "app\dashboard\markets\bonds\page.tsx",
    "app\dashboard\markets\synthetics\page.tsx",
    "app\dashboard\markets\real-estate\page.tsx"
)

foreach ($page in $marketPages) {
    $filePath = Join-Path $root $page
    if (Test-Path $filePath) {
        $c = Get-Content $filePath -Raw
        # Play button (Play icon)
        $c = $c -replace '(<button[^>]*className="[^"]*p-1\.5[^"]*"[^>]*>\s*<Play)', '$1 aria-label="Play stream" $2'
        # Search button
        $c = $c -replace '(<button[^>]*className="[^"]*p-1\.5[^"]*"[^>]*>\s*<Search)', '$1 aria-label="Search" $2'
        Set-Content $filePath $c -NoNewline
        Write-Host "  Fixed: $page"
    }
}

# Fix indices search button
$indicesFile = Join-Path $root "app\dashboard\markets\indices\page.tsx"
if (Test-Path $indicesFile) {
    $c = Get-Content $indicesFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-1\.5[^"]*"[^>]*>\s*<Search)', '$1 aria-label="Search" $2'
    Set-Content $indicesFile $c -NoNewline
    Write-Host "  Fixed: indices/page.tsx"
}

# Fix livestream controls
$liveFile = Join-Path $root "app\dashboard\resources\livestream\page.tsx"
if (Test-Path $liveFile) {
    $c = Get-Content $liveFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*text-gray-400[^"]*"[^>]*>\s*<Settings)', '$1 aria-label="Settings" $2'
    $c = $c -replace '(<button[^>]*className="[^"]*text-gray-400[^"]*"[^>]*>\s*<Maximize)', '$1 aria-label="Maximize" $2'
    $c = $c -replace '(<button[^>]*className="[^"]*text-gray-400[^"]*"[^>]*>\s*<Play)', '$1 aria-label="Play" $2'
    Set-Content $liveFile $c -NoNewline
    Write-Host "  Fixed: livestream/page.tsx"
}

# Fix contract calendar nav buttons
$calFile = Join-Path $root "app\dashboard\resources\contracts\calendar\page.tsx"
if (Test-Path $calFile) {
    $c = Get-Content $calFile -Raw
    $c = $c -replace '(<button[^>]*onClick=\{[^}]*prev[^}]*\}[^>]*>\s*<ChevronLeft)', '$1 aria-label="Previous" $2'
    $c = $c -replace '(<button[^>]*onClick=\{[^}]*next[^}]*\}[^>]*>\s*<ChevronRight)', '$1 aria-label="Next" $2'
    Set-Content $calFile $c -NoNewline
    Write-Host "  Fixed: contracts/calendar/page.tsx"
}

# Fix seasonality planner
$planFile = Join-Path $root "app\dashboard\resources\seasonality\planner\page.tsx"
if (Test-Path $planFile) {
    $c = Get-Content $planFile -Raw
    $c = $c -replace '(<button[^>]*onClick=\{[^}]*next[^}]*\}[^>]*>\s*<ChevronRight)', '$1 aria-label="Next month" $2'
    Set-Content $planFile $c -NoNewline
    Write-Host "  Fixed: seasonality/planner/page.tsx"
}

# Fix VPS buttons
$vpsFile = Join-Path $root "app\dashboard\resources\vps\page.tsx"
if (Test-Path $vpsFile) {
    $c = Get-Content $vpsFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*text-green-400[^"]*"[^>]*>\s*<Activity)', '$1 aria-label="Activity" $2'
    $c = $c -replace '(<button[^>]*className="[^"]*text-red-400[^"]*"[^>]*>\s*<Power)', '$1 aria-label="Power" $2'
    Set-Content $vpsFile $c -NoNewline
    Write-Host "  Fixed: vps/page.tsx"
}

# Fix PTD delete button
$ptdFile = Join-Path $root "app\dashboard\resources\ptd\pro\page.tsx"
if (Test-Path $ptdFile) {
    $c = Get-Content $ptdFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*text-red-400[^"]*"[^>]*>\s*<Trash)', '$1 aria-label="Delete" $2'
    Set-Content $ptdFile $c -NoNewline
    Write-Host "  Fixed: ptd/pro/page.tsx"
}

# Fix macro strength close button
$macroFile = Join-Path $root "app\dashboard\resources\macro\strength\page.tsx"
if (Test-Path $macroFile) {
    $c = Get-Content $macroFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*"[^>]*>\s*<X)', '$1 aria-label="Close filter" $2'
    Set-Content $macroFile $c -NoNewline
    Write-Host "  Fixed: macro/strength/page.tsx"
}

# Fix education PDF download button
$pdfFile = Join-Path $root "app\dashboard\education\pdf\page.tsx"
if (Test-Path $pdfFile) {
    $c = Get-Content $pdfFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*"[^>]*>\s*<Download)', '$1 aria-label="Download PDF" $2'
    Set-Content $pdfFile $c -NoNewline
    Write-Host "  Fixed: education/pdf/page.tsx"
}

# Fix support tickets archive button
$ticketsFile = Join-Path $root "app\dashboard\support\tickets\page.tsx"
if (Test-Path $ticketsFile) {
    $c = Get-Content $ticketsFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-1[^"]*"[^>]*>\s*<Archive)', '$1 aria-label="Archive ticket" $2'
    Set-Content $ticketsFile $c -NoNewline
    Write-Host "  Fixed: support/tickets/page.tsx"
}

# Fix KYC view button
$kycFile = Join-Path $root "app\dashboard\kyc\page.tsx"
if (Test-Path $kycFile) {
    $c = Get-Content $kycFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-1[^"]*"[^>]*>\s*<Eye)', '$1 aria-label="View document" $2'
    Set-Content $kycFile $c -NoNewline
    Write-Host "  Fixed: kyc/page.tsx"
}

# Fix admin CMS action buttons
$cmsFiles = @(
    "app\admin\cms\news\page.tsx",
    "app\admin\cms\events\page.tsx",
    "app\admin\cms\media\page.tsx"
)

foreach ($page in $cmsFiles) {
    $filePath = Join-Path $root $page
    if (Test-Path $filePath) {
        $c = Get-Content $filePath -Raw
        $c = $c -replace '(<button[^>]*className="[^"]*p-1[^"]*"[^>]*>\s*<Eye)', '$1 aria-label="View" $2'
        $c = $c -replace '(<button[^>]*className="[^"]*p-1[^"]*"[^>]*>\s*<Pencil)', '$1 aria-label="Edit" $2'
        $c = $c -replace '(<button[^>]*className="[^"]*p-1[^"]*"[^>]*>\s*<Trash)', '$1 aria-label="Delete" $2'
        Set-Content $filePath $c -NoNewline
        Write-Host "  Fixed: $page"
    }
}

# Fix admin menus add button
$menusFile = Join-Path $root "app\admin\cms\menus\page.tsx"
if (Test-Path $menusFile) {
    $c = Get-Content $menusFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*"[^>]*>\s*<Plus)', '$1 aria-label="Add menu item" $2'
    Set-Content $menusFile $c -NoNewline
    Write-Host "  Fixed: admin/cms/menus/page.tsx"
}

# Fix admin pools buttons
$poolsFile = Join-Path $root "app\admin\pools\page.tsx"
if (Test-Path $poolsFile) {
    $c = Get-Content $poolsFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*"[^>]*>\s*<Filter)', '$1 aria-label="Filter" $2'
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*"[^>]*>\s*<MoreVertical)', '$1 aria-label="Actions" $2'
    Set-Content $poolsFile $c -NoNewline
    Write-Host "  Fixed: admin/pools/page.tsx"
}

# Fix notifications page filter button
$notifFile = Join-Path $root "app\dashboard\notificatations\page.tsx"
if (Test-Path $notifFile) {
    $c = Get-Content $notifFile -Raw
    $c = $c -replace '(<button[^>]*className="[^"]*p-2[^"]*"[^>]*>\s*<Filter)', '$1 aria-label="Filter notifications" $2'
    Set-Content $notifFile $c -NoNewline
    Write-Host "  Fixed: notifications/page.tsx"
}

Write-Host ""
Write-Host "Accessibility fixes complete"
