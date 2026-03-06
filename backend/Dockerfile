# Multi-stage Dockerfile for the FastAPI backend
#
# Stage 1 (builder): Install Python dependencies in an isolated layer
# Stage 2 (runtime): Copy only what's needed — keeps the final image small

# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies first (separate layer = cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Runtime ───────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Expose port 8000 (documents intent — actual port mapping is in docker-compose)
EXPOSE 8000

# Start the API with uvicorn
# --host 0.0.0.0 : listen on all interfaces inside the container (required for Docker)
# --reload       : auto-reload on code changes (for dev; remove for prod)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
