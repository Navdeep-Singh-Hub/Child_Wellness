# PowerShell script to set JAVA_HOME and run Android build
# Replace YOUR_JDK_PATH with the actual path from Android Studio

# Set your JDK path here
$jdkPath = "D:\Softwares\android studio\jbr"

# Check if JDK path exists
if (-not $jdkPath -or -not (Test-Path $jdkPath)) {
    Write-Host "ERROR: JDK path not set or not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To find your JDK path:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio"
    Write-Host "2. Go to File -> Settings -> Build Tools -> Gradle"
    Write-Host "3. Check the 'Gradle JDK' dropdown - it shows the path"
    Write-Host ""
    Write-Host "Then edit this script and set `$jdkPath to that path"
    exit 1
}

# Set JAVA_HOME
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;$env:PATH"

Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

# Verify Java is accessible
$javaVersion = java -version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Java version:" -ForegroundColor Green
    Write-Host $javaVersion
    Write-Host ""
    Write-Host "Running: npx expo run:android" -ForegroundColor Cyan
    npx expo run:android
} else {
    Write-Host "ERROR: Java not found at $jdkPath" -ForegroundColor Red
    exit 1
}

