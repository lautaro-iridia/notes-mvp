#!/bin/sh
set -e

echo "Starting backend entrypoint..."

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do
    sleep 1
done
echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec "$@"
