# PowerShell script to clean project artifacts
Write-Host "Cleaning project artifacts for portability..." -ForegroundColor Cyan

# List of folders/files to remove
$artifacts = @("node_modules", ".next", "out", "build", "tsconfig.tsbuildinfo")

foreach ($item in $artifacts) {
    if (Test-Path $item) {
        Write-Host "Removing $item..."
        try {
            Remove-Item -Path $item -Recurse -Force -ErrorAction Stop
            Write-Host "Successfully removed $item" -ForegroundColor Green
        } catch {
            Write-Host "Failed to remove $item. Please close any applications using these files and try again." -ForegroundColor Red
        }
    } else {
        Write-Host "$item not found, skipping." -ForegroundColor Gray
    }
}

Write-Host "Cleanup complete! You can now move this folder." -ForegroundColor Cyan
Write-Host "To start again in a new location, run:" -ForegroundColor Yellow
Write-Host "npm install" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
