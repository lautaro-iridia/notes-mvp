# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build for production
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Production
FROM nginx:1.27-alpine

# Copy nginx configuration
COPY docker/frontend/nginx.conf /etc/nginx/nginx.conf
# Default config for docker-compose local (fallback)
COPY docker/frontend/default.conf /etc/nginx/conf.d/default.conf
# Template for Railway (processed by entrypoint if PORT/BACKEND_URL are set)
COPY docker/frontend/default.conf.template /etc/nginx/templates/default.conf.template

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY scripts/entrypoint-frontend.sh /docker-entrypoint.d/40-entrypoint-frontend.sh
RUN chmod +x /docker-entrypoint.d/40-entrypoint-frontend.sh

# Environment variables for Railway (with defaults for local)
ENV PORT=3000
ENV BACKEND_URL=backend:8000

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
