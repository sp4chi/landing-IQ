# 🚀 LandingIQ — Enterprise Production Deployment Guide
**Live Application URL**: [https://landingiq.duckdns.org/](https://landingiq.duckdns.org/)

This document provides a comprehensive, end-to-end technical guide to the production deployment architecture of **LandingIQ**, covering Docker multi-stage containerization, AWS EC2 provisioning, free domain mapping via DuckDNS, automated Let's Encrypt TLS/SSL certificates via Caddy, and zero-downtime GitHub Actions CI/CD.

---

## 🏛️ System Architecture Overview

```mermaid
flowchart TD
    subgraph Developer Laptop
        A[Git Commit & Push] -->|Push to branch aws-ec2-docker| B[GitHub Repository]
    end

    subgraph GitHub Actions CI/CD Pipeline
        B --> C[Job 1: Build & Push]
        C -->|Docker Buildx| D[Build Docker Image]
        D -->|Push Image| E[(Docker Hub: sp4chi/landingiq:latest)]
        
        B --> F[Job 2: Deploy to EC2]
        F -->|SSH Command| G[AWS EC2 Instance]
    end

    subgraph AWS EC2 Production Server
        G --> H[Docker Compose Stack]
        E -->|Docker Pull| H
        
        subgraph Docker Network
            I[Caddy Reverse Proxy Container]
            J[LandingIQ App Container]
            I -->|HTTP Proxy port 3000| J
        end
    end

    subgraph End Users & HTTPS Verification
        K[Web Browser] -->|HTTPS: port 443| L[DuckDNS A-Record: landingiq.duckdns.org]
        L -->|Elastic IP| I
        I <-->|Auto ACME Challenge| M[Let's Encrypt Certificate Authority]
    end
```

---

## 📦 Phase 1: Docker Multi-Stage Containerization Architecture

To ensure **100% real Playwright Chromium visual screenshot rendering** without high RAM consumption or missing Linux system libraries, LandingIQ uses a optimized **2-stage Docker build**.

### 1. `Dockerfile` ([`Dockerfile`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/Dockerfile))

```dockerfile
# --- Stage 1: Build frontend + compile server ---
FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production runtime ---
FROM node:20-slim AS runtime

WORKDIR /app

# Install OS-level dependencies Playwright's Chromium needs to actually launch
RUN apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libasound2 \
    libatspi2.0-0 libxshmfence1 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Install Playwright's Chromium binary explicitly
RUN npx playwright install --with-deps chromium

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
```

---

### 2. `docker-compose.prod.yml` ([`docker-compose.prod.yml`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/docker-compose.prod.yml))

```yaml
version: '3.8'

services:
  app:
    image: sp4chi/landingiq:latest
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app

volumes:
  caddy_data:
  caddy_config:
```

---

## 🌐 Phase 2: Static IP Allocation & DuckDNS Free Domain Mapping

### Step 1: AWS Elastic IP (Static IP)
To prevent your EC2 instance's IP address from changing whenever the server stops or restarts:
1. Go to **AWS Console** $\rightarrow$ **EC2** $\rightarrow$ **Network & Security** $\rightarrow$ **Elastic IPs**.
2. Click **Allocate Elastic IP address**.
3. Select the allocated IP $\rightarrow$ **Actions** $\rightarrow$ **Associate Elastic IP address** $\rightarrow$ select your `landingiq-prod` instance.

---

### Step 2: DuckDNS Domain Mapping
1. Go to **[duckdns.org](https://www.duckdns.org)** and sign in with GitHub.
2. Under **domains**, type `landingiq` to claim `landingiq.duckdns.org`.
3. In the **IP field**, paste your **AWS Elastic IP address**.
4. Click **update ip**.
5. Test DNS resolution:
   ```bash
   ping landingiq.duckdns.org
   ```

---

## 🔒 Phase 3: Automated HTTPS & Reverse Proxy via Caddy

Instead of manually managing Nginx configuration files and running `certbot` renewal cron jobs, LandingIQ uses **Caddy 2**. Caddy automatically provisions and renews free **Let's Encrypt TLS/SSL certificates** out of the box via ACME challenges.

### `Caddyfile` ([`Caddyfile`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/Caddyfile))

```caddyfile
landingiq.duckdns.org {
    reverse_proxy app:3000

    encode gzip

    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
    }
}
```

---

## 🔄 Phase 4: Automated CI/CD Pipeline (GitHub Actions + Docker Hub)

Building heavy Docker containers with Playwright Chromium directly on an EC2 `t3.micro` or `t3.small` server can exhaust CPU and RAM. To solve this, LandingIQ uses a **2-stage GitHub Actions workflow**:

1. **Build & Push Job** (Runs on GitHub's cloud runners): Builds the Docker image and pushes `sp4chi/landingiq:latest` to Docker Hub.
2. **Deploy Job** (Runs via SSH): SSHs into EC2, pulls the pre-built image from Docker Hub, and restarts the container stack in seconds.

### Workflow Configuration ([`.github/workflows/deploy.yml`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/.github/workflows/deploy.yml))

```yaml
name: Build, Push, and Deploy to EC2

on:
  push:
    branches:
      - aws-ec2-docker
      - main

jobs:
  build-and-push:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/landingiq:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/landingiq:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to EC2
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: SSH and pull + run the new image
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          command_timeout: 15m
          script: |
            echo "🚀 Pulling latest image and redeploying..."
            cd ~/landing-IQ || exit 1
            git fetch --all
            git checkout aws-ec2-docker
            docker login -u ${{ secrets.DOCKERHUB_USERNAME }} -p ${{ secrets.DOCKERHUB_TOKEN }}
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/landingiq:latest
            docker compose -f docker-compose.prod.yml up -d --no-build
            docker image prune -f --filter "until=24h"
            echo "✅ Deployment completed successfully!"
```

---

### Required GitHub Repository Secrets

Go to **GitHub Repo** $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**:

| Secret Name | Purpose | Example Value |
| :--- | :--- | :--- |
| **`DOCKERHUB_USERNAME`** | Your Docker Hub account username | `sp4chi` |
| **`DOCKERHUB_TOKEN`** | Docker Hub Personal Access Token (Read/Write) | `dckr_pat_...` |
| **`EC2_HOST`** | AWS EC2 Elastic IP address | `54.210.12.34` |
| **`EC2_SSH_KEY`** | Content of your `.pem` private SSH key | `-----BEGIN RSA PRIVATE KEY-----...` |

---

## 🛠️ Phase 5: One-Time AWS EC2 Server Provisioning Commands

Run these commands once when setting up a fresh Ubuntu EC2 instance:

```bash
# 1. Connect to EC2
ssh -i landingiq-key.pem ubuntu@<YOUR-EC2-ELASTIC-IP>

# 2. Expand disk partition to 20GB (Free Tier allows up to 30GB)
sudo growpart /dev/nvme0n1 1 2>/dev/null || sudo growpart /dev/xvda 1 2>/dev/null
sudo resize2fs /dev/root 2>/dev/null || sudo resize2fs /dev/nvme0n1p1 2>/dev/null || sudo resize2fs /dev/xvda1 2>/dev/null

# 3. Install Docker & Docker Compose
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker $USER
newgrp docker

# 4. Clone repository
git clone https://github.com/sp4chi/landing-IQ.git
cd landing-IQ
git checkout aws-ec2-docker

# 5. Create production .env file
nano .env
```

Paste your production keys in `.env`:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:...@ep-odd-waterfall...aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=a_long_secure_random_string_12345
GEMINI_API_KEY=AIzaSy...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://landingiq.duckdns.org/api/auth/google/callback
```

```bash
# 6. Initial Launch
docker compose -f docker-compose.prod.yml up -d
```

---

## ✅ Summary Verification

After deployment, verify that:
1. `https://landingiq.duckdns.org/` loads over **HTTPS** with a valid Let's Encrypt certificate.
2. Playwright Chromium screenshot capture runs natively in the Docker container.
3. Every `git push` to `aws-ec2-docker` triggers an automated GitHub Actions deployment.
