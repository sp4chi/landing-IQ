# 🚀 Deploying LandingIQ on AWS EC2 (Docker Branch)

This document provides step-by-step instructions to deploy LandingIQ on an **AWS EC2 Ubuntu Instance** using Docker and Docker Compose. 

The `aws-ec2-docker` branch uses the official Playwright Docker image (`mcr.microsoft.com/playwright:v1.42.0-jammy`), ensuring **100% real high-resolution screenshots** using native Playwright Chromium with zero third-party API dependencies.

---

## 📋 Prerequisites

- An **AWS Account**
- An **EC2 Instance** running **Ubuntu 22.04 LTS** (Recommended instance type: `t3.small` or `t3.medium` with at least 2GB RAM for Playwright Chromium).
- **AWS Security Group** configured to allow inbound traffic on **Port 3000** (HTTP) and **Port 22** (SSH).

---

## 🛠️ Step-by-Step EC2 Deployment Guide

### Step 1: SSH into your EC2 Instance
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

### Step 2: Update Packages & Install Docker & Docker Compose
Run the following commands on your EC2 instance:
```bash
# Update Ubuntu package lists
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-plugin

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Allow current user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 3: Clone the Repository & Switch to `aws-ec2-docker` Branch
```bash
# Clone the repository
git clone https://github.com/sp4chi/landing-IQ.git
cd landing-IQ

# Checkout the dedicated AWS EC2 Docker branch
git checkout aws-ec2-docker
```

---

### Step 4: Create `.env` Environment File (Optional API Keys)
Create a `.env` file in the project root:
```bash
nano .env
```
Paste your API keys (Gemini, Groq, Anthropic, OpenAI, or HuggingFace):
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit).*

---

### Step 5: Build and Launch the Docker Container
Run Docker Compose to build the production image and start the application in background mode:
```bash
docker compose up -d --build
```

---

### Step 6: Verify Container & Playwright Screenshots
Check container status and view logs:
```bash
# Check container status
docker ps

# View application logs in real-time
docker logs -f landingiq-app
```

---

### 🌐 Step 7: Access Your Deployed LandingIQ App
Open your web browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>:3000
```

---

## 🔄 Updating / Redeploying New Code Changes
Whenever you update code on GitHub, redeploy on your EC2 instance with:
```bash
cd landing-IQ
git pull origin aws-ec2-docker
docker compose up -d --build
```
