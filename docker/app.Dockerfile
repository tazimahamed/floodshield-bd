FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /srv
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ curl libexpat1 && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
# CPU-only torch: the voice fallback does not need a GPU, and the default build is several GB larger
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt
COPY backend ./backend
COPY scripts ./scripts
WORKDIR /srv/backend
HEALTHCHECK --interval=60s --timeout=10s --start-period=120s CMD curl -fsS http://127.0.0.1:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=172.30.0.0/24"]
