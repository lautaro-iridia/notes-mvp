#!/bin/sh
set -e

echo "Frontend container starting..."

# Process nginx config template only in Railway environment
# Railway sets RAILWAY_ENVIRONMENT automatically
# In docker-compose local, use the default.conf as-is (port 5173)
if [ -n "$RAILWAY_ENVIRONMENT" ] && [ -f /etc/nginx/templates/default.conf.template ]; then
    echo "Railway environment detected, processing nginx config template..."
    echo "  PORT=${PORT:-3000}"
    echo "  BACKEND_URL=${BACKEND_URL:-backend:8000}"

    # Export defaults if not set
    export PORT=${PORT:-3000}
    export BACKEND_URL=${BACKEND_URL:-backend:8000}

    # Use envsubst with specific variable list to avoid replacing nginx variables
    envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
    echo "Nginx config generated at /etc/nginx/conf.d/default.conf"
else
    echo "Using default nginx config (docker-compose local mode)"
fi

# Runtime environment variable injection (optional)
# This allows changing API URL at container start time
if [ -n "$RUNTIME_API_URL" ]; then
    echo "Injecting runtime API URL: $RUNTIME_API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__VITE_API_URL__|$RUNTIME_API_URL|g" {} \;
fi

echo "Frontend ready!"
