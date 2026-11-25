# Neon Fusion 2048 - Windows PowerShell Deployment Helper Script
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("cloudflare", "vercel", "cloudrun", "docker", "check")]
    [string]$Target
)

function Show-Menu {
    Write-Host "=== Neon Fusion 2048 Deployment Helper ===" -ForegroundColor Cyan
    Write-Host "1) Build & Deploy Frontend to Cloudflare Pages (wrangler)"
    Write-Host "2) Build & Deploy Frontend to Vercel (vercel CLI)"
    Write-Host "3) Build & Deploy Backend to Google Cloud Run (gcloud)"
    Write-Host "4) Build & Run Full Stack locally with Docker Compose"
    Write-Host "5) Run pre-deploy verification (bun run check)"
    Write-Host "Q) Quit"
    return (Read-Host "Enter choice [1-5/Q]").Trim()
}

if (-not $Target) {
    $choice = Show-Menu
    switch ($choice) {
        "1" { $Target = "cloudflare" }
        "2" { $Target = "vercel" }
        "3" { $Target = "cloudrun" }
        "4" { $Target = "docker" }
        "5" { $Target = "check" }
        default { Write-Host "Exiting."; exit 0 }
    }
}

switch ($Target) {
    "cloudflare" {
        Write-Host "Building frontend..." -ForegroundColor Green
        bun run build
        Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Green
        npx wrangler pages deploy apps/web/dist --project-name neon-fusion-2048
    }
    "vercel" {
        Write-Host "Building frontend..." -ForegroundColor Green
        bun run build
        Write-Host "Deploying to Vercel..." -ForegroundColor Green
        npx vercel --prod
    }
    "cloudrun" {
        $proj = Read-Host "Enter Google Cloud Project ID"
        $reg = Read-Host "Enter Region (default: asia-southeast1)"
        if (-not $reg) { $reg = "asia-southeast1" }
        Write-Host "Deploying API to Google Cloud Run..." -ForegroundColor Green
        gcloud run deploy neon-fusion-api `
            --project $proj `
            --region $reg `
            --source . `
            --allow-unauthenticated `
            --port 8080 `
            --set-env-vars CORS_ORIGIN="*"
    }
    "docker" {
        Write-Host "Starting full stack via Docker Compose..." -ForegroundColor Green
        docker compose up --build -d
        Write-Host "App running on http://localhost:8080 (API on http://localhost:3000)" -ForegroundColor Cyan
    }
    "check" {
        Write-Host "Running typecheck, tests, and build..." -ForegroundColor Green
        bun run check
    }
}
