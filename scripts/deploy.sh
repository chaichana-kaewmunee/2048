#!/usr/bin/env bash
set -euo pipefail

# Neon Fusion 2048 - Unified Deployment Helper Script

echo "=== Neon Fusion 2048 Deployment Helper ==="
echo "Select target to deploy:"
echo "1) Build & Deploy Frontend to Cloudflare Pages (wrangler)"
echo "2) Build & Deploy Frontend to Vercel (vercel CLI)"
echo "3) Build & Deploy Backend to Google Cloud Run (gcloud)"
echo "4) Build & Run Full Stack locally with Docker Compose"
echo "5) Run pre-deploy verification (bun run check)"
echo "q) Quit"

read -rp "Enter choice [1-5/q]: " choice

case "$choice" in
  1)
    echo "Building frontend..."
    bun run build
    echo "Deploying to Cloudflare Pages..."
    npx wrangler pages deploy apps/web/dist --project-name neon-fusion-2048
    ;;
  2)
    echo "Building frontend..."
    bun run build
    echo "Deploying to Vercel..."
    npx vercel --prod
    ;;
  3)
    read -rp "Enter Google Cloud Project ID: " gcp_project
    read -rp "Enter Region (default: asia-southeast1): " gcp_region
    gcp_region=${gcp_region:-asia-southeast1}
    echo "Deploying API to Google Cloud Run..."
    gcloud run deploy neon-fusion-api \
      --project "$gcp_project" \
      --region "$gcp_region" \
      --source . \
      --allow-unauthenticated \
      --port 8080 \
      --set-env-vars CORS_ORIGIN="*"
    ;;
  4)
    echo "Starting full stack via Docker Compose..."
    docker compose up --build -d
    echo "App running on http://localhost:8080 (API on http://localhost:3000)"
    ;;
  5)
    echo "Running typecheck, tests, and build..."
    bun run check
    ;;
  q|Q)
    echo "Exiting."
    exit 0
    ;;
  *)
    echo "Invalid option."
    exit 1
    ;;
esac
