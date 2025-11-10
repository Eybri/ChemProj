# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# system deps (if needed)
RUN apt-get update && apt-get install -y build-essential --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app

# ensure the DB path exists (we'll mount a volume at /data)
RUN mkdir -p /data
ENV DATABASE_URL="sqlite:////data/chemlab_inventory.db"

# Expose the port expected by fly
EXPOSE 8080

# Use Uvicorn with host 0.0.0.0 and port from env
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
