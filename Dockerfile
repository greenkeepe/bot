# Composite Dockerfile for Python (Bot) and Node.js (Dashboard)
FROM node:20-slim as node-builder
WORKDIR /app/web-dashboard
COPY web-dashboard/package*.json ./
RUN npm install
COPY web-dashboard/ .
RUN npm run build

FROM python:3.11-slim
# Install Node.js in the Python image
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

WORKDIR /app

# Setup Engine
COPY engine/requirements.txt ./engine/
RUN pip install --no-cache-dir -r engine/requirements.txt
COPY engine/ ./engine/

# Setup Web Dashboard
COPY --from=node-builder /app/web-dashboard ./web-dashboard/

# Expose ports
EXPOSE 3000
EXPOSE 8765

# Start both services
CMD python engine/main.py & cd web-dashboard && npm run start
