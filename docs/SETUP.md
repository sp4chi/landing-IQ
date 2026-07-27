# Fixed CI/CD Pipeline — Build in Actions, Deploy on EC2

## Why this fixes the freeze
Previously, `docker compose up -d --build` ran the *entire* build — `npm ci`, `vite build`,
`tsc`, and `npx playwright install --with-deps chromium` (a real browser download) — directly on
your `t3.micro`'s 1GB of RAM. Combined with `docker system prune -f` wiping the build cache after
every deploy, every single deployment was rebuilding from scratch and exhausting memory, which is
what froze SSH access.

Now: GitHub Actions (with plenty of RAM) builds the image and pushes it to Docker Hub. EC2 only
runs `docker pull` + `docker compose up -d --no-build` — no compiling, no Playwright download, ever,
on the small instance again.

## One-time setup

### 1. Create a Docker Hub account + access token
1. Sign up free at hub.docker.com
2. Account Settings → Security → **New Access Token** (don't use your account password directly)
3. Copy the token — you won't see it again

### 2. Add these secrets in GitHub
Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | your Docker Hub username |
| `DOCKERHUB_TOKEN` | the access token from step 1 |
| `EC2_HOST` | your Elastic IP |
| `EC2_SSH_KEY` | your `.pem` file content (already fixed and working) |

Delete any old fallback secrets (`SSH_KEY`, `EC2_KEY`, `HOST`, `EC2_IP`) if they still exist, to
avoid ambiguity about which one is actually in use.

### 3. Update docker-compose.prod.yml on EC2
Replace `YOUR_DOCKERHUB_USERNAME` in the included `docker-compose.prod.yml` with your real Docker
Hub username, then copy it onto the server (overwrite the existing file):
```bash
scp -i landingiq-key.pem docker-compose.prod.yml ubuntu@<your-elastic-ip>:~/landing-IQ/
```

### 4. Replace the old workflow file
Copy `.github/workflows/deploy.yml` from this bundle into your repo at the same path, replacing
whatever workflow file you had before. Commit and push.

## What happens on every push now

1. **build-and-push job** (runs on GitHub's servers): builds the Docker image, pushes it to Docker
   Hub tagged both `:latest` and with the commit SHA (so you always have a rollback point)
2. **deploy job** (runs after build-and-push succeeds): SSHes into EC2, pulls the freshly pushed
   image, and restarts the container with it — no building happens on EC2 at all

## If you ever need to roll back
Since every build is also tagged with its commit SHA, you can deploy an older version manually:
```bash
ssh -i landingiq-key.pem ubuntu@<your-elastic-ip>
docker pull YOUR_DOCKERHUB_USERNAME/landingiq:<old-commit-sha>
docker tag YOUR_DOCKERHUB_USERNAME/landingiq:<old-commit-sha> YOUR_DOCKERHUB_USERNAME/landingiq:latest
docker compose -f docker-compose.prod.yml up -d --no-build
```

## One more safety net worth adding later
Even with builds off the instance, it's worth adding a small swap file permanently (not just as the
one-time emergency fix from earlier) so the instance degrades gracefully instead of freezing if
memory pressure ever spikes for any other reason:
```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
