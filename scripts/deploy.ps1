param(
    [string]$Action = "status",
    [string]$ComposeFile = "docker-compose.yml"
)

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $rootDir

switch ($Action) {
    "build" {
        Write-Host "Building Docker images..."
        docker compose -f $ComposeFile build
    }
    "up" {
        Write-Host "Starting services..."
        docker compose -f $ComposeFile up -d
    }
    "down" {
        Write-Host "Stopping services..."
        docker compose -f $ComposeFile down
    }
    "restart" {
        Write-Host "Restarting services..."
        docker compose -f $ComposeFile restart
    }
    "logs" {
        docker compose -f $ComposeFile logs -f
    }
    "migrate" {
        Write-Host "Running Prisma migrations..."
        docker compose -f $ComposeFile exec backend npx prisma migrate deploy
    }
    "backup" {
        Write-Host "Running database backup..."
        docker compose -f $ComposeFile exec mysql mysqldump -u root -p${env:MYSQL_ROOT_PASSWORD} pro_evol > ".\backups\pro_evol_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    }
    "status" {
        docker compose -f $ComposeFile ps
    }
    default {
        Write-Host "Usage: ./scripts/deploy.ps1 [build|up|down|restart|logs|migrate|backup|status]"
    }
}
