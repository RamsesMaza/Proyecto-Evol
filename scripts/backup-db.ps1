param(
    [string]$OutputDir = ".\backups",
    [string]$DbUser = "root",
    [string]$DbPass = "root",
    [string]$DbName = "pro_evol",
    [string]$DbHost = "localhost"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "${DbName}_${timestamp}.sql"
$outputPath = Join-Path -Path $OutputDir -ChildPath $filename

if (-not (Test-Path -Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Created directory: $OutputDir"
}

Write-Host "Backing up database $DbName to $outputPath ..."

# Use the full path to mysqldump if needed, otherwise rely on PATH
$env:MYSQL_PWD = $DbPass
mysqldump -u $DbUser -h $DbHost --databases $DbName --routines --triggers --single-transaction > $outputPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Backup saved to $outputPath"

    # Compress
    Compress-Archive -Path $outputPath -DestinationPath "${outputPath}.zip" -Force
    Remove-Item -Path $outputPath
    Write-Host "Compressed to: ${outputPath}.zip"
} else {
    Write-Host "ERROR: Backup failed"
    exit 1
}
