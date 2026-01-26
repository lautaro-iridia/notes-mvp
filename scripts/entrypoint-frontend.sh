#!/bin/sh
set -e

echo "Frontend container starting..."
echo "  PORT=${PORT:-3000}"
echo "  BACKEND_URL=${BACKEND_URL:-backend:8000}"

# Note: nginx automatically processes /etc/nginx/templates/*.template
# with envsubst, replacing ${VAR} with environment variable values

# Runtime environment variable injection (optional)
# This allows changing API URL at container start time
if [ -n "$RUNTIME_API_URL" ]; then
    echo "Injecting runtime API URL: $RUNTIME_API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__VITE_API_URL__|$RUNTIME_API_URL|g" {} \;
fi

echo "Frontend ready!"
