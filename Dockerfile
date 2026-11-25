# Production Dockerfile for Neon Fusion 2048 Backend API (Elysia on Bun)
# Compatible with Google Cloud Run, AWS ECS/Fargate, Render, and standard Docker VPS
FROM oven/bun:1-slim AS base

WORKDIR /app

# Copy root workspace and monorepo package manifests
COPY package.json bun.lock tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY packages/storage/package.json ./packages/storage/

# Install production dependencies
RUN bun install --frozen-lockfile --production

# Copy source files
COPY packages/core/ ./packages/core/
COPY apps/api/ ./apps/api/

# Cloud Run defaults to PORT 8080, local defaults to 3000
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Run Elysia API server
CMD ["bun", "run", "--cwd", "apps/api", "start"]
