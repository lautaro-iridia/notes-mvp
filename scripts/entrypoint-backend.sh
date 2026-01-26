#!/bin/sh
set -e

echo "Starting backend entrypoint..."

# Wait for database only if DB_HOST is set (docker-compose local)
# Railway manages service dependencies via private networking
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database at $DB_HOST:${DB_PORT:-5432}..."
    until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -q 2>/dev/null; do
        sleep 1
    done
    echo "Database is ready!"
fi

# Run migrations
echo "Running database migrations..."
alembic upgrade head

echo "Starting application on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
