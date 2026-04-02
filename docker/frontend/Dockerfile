# Stage 1: Install dependencies (shared base)
FROM node:22-alpine AS deps

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

# Stage 2: Development — source code comes from volume mount at runtime
FROM deps AS dev

# Stage 3: Production build
FROM deps AS builder

COPY frontend/ .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Production
FROM nginx:1.27-alpine

# Copy nginx configuration
COPY docker/frontend/nginx.conf /etc/nginx/nginx.conf

# Use template for nginx config - nginx will process it with envsubst automatically
# This works for both local (with defaults) and Railway (with injected vars)
COPY docker/frontend/default.conf.template /etc/nginx/templates/default.conf.template

# Remove default nginx config (we use template)
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint scripts
# 15-detect-dns-resolver.envsh: Sourced before envsubst to detect DNS resolver
# 40-entrypoint-frontend.sh: Runs after nginx config is ready
COPY scripts/15-detect-dns-resolver.envsh /docker-entrypoint.d/15-detect-dns-resolver.envsh
COPY scripts/entrypoint-frontend.sh /docker-entrypoint.d/40-entrypoint-frontend.sh
RUN chmod +x /docker-entrypoint.d/15-detect-dns-resolver.envsh /docker-entrypoint.d/40-entrypoint-frontend.sh

# Environment variables with defaults
# Railway overrides PORT automatically
ENV PORT=3000
ENV BACKEND_URL=backend:8000
# DNS resolver for nginx upstream resolution
# - "auto": Auto-detect from /etc/resolv.conf (recommended)
# - Docker: 127.0.0.11 (Docker's internal DNS)
# - Custom: Any valid DNS IP address
ENV DNS_RESOLVER=auto

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
