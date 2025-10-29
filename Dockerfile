# Multi-stage Dockerfile for foxucs-back-end-node
# Builds the app and produces a small runtime image.
FROM node:20-bullseye-slim AS builder

WORKDIR /usr/src/app

# Install build deps for native modules and netcat for health checks
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential netcat \
  && rm -rf /var/lib/apt/lists/*

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests and lockfile first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev deps used by migrations/tools)
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Remove test/dev artifacts that should not be in production image (optional)

FROM node:20-bullseye-slim AS runner
WORKDIR /usr/src/app

# Install runtime deps used by entrypoint (netcat)
RUN apt-get update \
  && apt-get install -y --no-install-recommends netcat \
  && rm -rf /var/lib/apt/lists/*

# Enable corepack/pnpm in runtime as well
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy node modules and app from builder
COPY --from=builder /usr/src/app /usr/src/app

WORKDIR /usr/src/app

# Expose app port (matches SERVER_PORT .env default 4000)
EXPOSE 4000

# Add entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh
RUN chmod +x /usr/src/app/docker-entrypoint.sh

ENV NODE_ENV=production

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD ["pnpm", "start"]
