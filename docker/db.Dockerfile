# Built from postgres + apt because the postgis/postgis image has no ARM build (Oracle Free is ARM)
FROM postgres:16-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-16-postgis-3 && rm -rf /var/lib/apt/lists/*
