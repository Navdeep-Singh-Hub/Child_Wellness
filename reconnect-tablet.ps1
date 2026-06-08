# Reconnect USB tablet to Metro dev server (run after plugging cable in)
Set-Location $PSScriptRoot

Write-Host "Checking tablet..." -ForegroundColor Cyan
adb kill-server | Out-Null
Start-Sleep -Seconds 1
$devices = adb devices 2>&1 | Out-String

if ($devices -match "unauthorized") {
    Write-Host ""
    Write-Host "TABLET NOT AUTHORIZED" -ForegroundColor Red
    Write-Host "On your tablet: tap ALLOW on the USB debugging popup, then run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if ($devices -notmatch "`tdevice") {
    Write-Host ""
    Write-Host "NO TABLET FOUND" -ForegroundColor Red
    Write-Host "Plug in USB cable, enable USB debugging, then run again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Tablet OK" -ForegroundColor Green
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
Write-Host "Ports forwarded (8081 Metro, 4000 backend)" -ForegroundColor Green

Write-Host "Opening ChildWellness app..." -ForegroundColor Cyan
adb shell am start -a android.intent.action.VIEW -d "exp+childwellness://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081"

Write-Host ""
Write-Host "Done! If app is blank, press 'r' in the Metro terminal to reload." -ForegroundColor Green
