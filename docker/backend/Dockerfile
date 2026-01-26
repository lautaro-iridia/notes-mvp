# Stage 1: Builder
FROM python:3.12-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    postgresql-dev

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.12-alpine AS production

WORKDIR /app

# Install runtime dependencies (postgresql-client for pg_isready in entrypoint)
RUN apk add --no-cache \
    libpq \
    libffi \
    postgresql-client

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY backend/ .

# Copy entrypoint script
COPY scripts/entrypoint-backend.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create non-root user
RUN adduser -D appuser && chown -R appuser:appuser /app
USER appuser

# Railway provides PORT env variable, default to 8000
ENV PORT=8000
EXPOSE $PORT

ENTRYPOINT ["/entrypoint.sh"]
