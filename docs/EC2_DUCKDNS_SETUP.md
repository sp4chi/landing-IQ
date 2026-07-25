# LandingIQ on EC2 + Docker + DuckDNS — Full Setup Guide

## Step 1 — Launch the EC2 instance

1. AWS Console → **EC2** → **Launch Instance**
2. AMI: **Ubuntu Server 24.04 LTS**
3. Instance type: **t3.micro** (or t2.micro if that's what your account's free-tier credits cover)
4. Key pair: create a new one, download the `.pem` file, keep it safe — you need it to SSH in
5. **Security group** — this is important, open exactly these inbound ports:
   | Type | Port | Source |
   |---|---|---|
   | SSH | 22 | Your IP only (not 0.0.0.0/0, for security) |
   | HTTP | 80 | Anywhere (0.0.0.0/0) — needed for Let's Encrypt cert validation |
   | HTTPS | 443 | Anywhere (0.0.0.0/0) |
6. Launch the instance.

## Step 2 — Attach an Elastic IP (so your address never changes)

1. EC2 Console → **Elastic IPs** → **Allocate Elastic IP address**
2. Select it → **Actions** → **Associate Elastic IP address** → choose your instance
3. Copy this IP — you'll point DuckDNS at it next.

Without this, your instance's public IP changes every time you stop/start it, which would break your domain pointing and your OAuth redirect URI every time.

## Step 3 — Set up your free DuckDNS domain

1. Go to **duckdns.org**, sign in (GitHub/Google/etc.)
2. Under "domains," type a subdomain name, e.g. `landingiq` → this gives you `landingiq.duckdns.org`
3. Paste your **Elastic IP** from Step 2 into the IP field next to it, click **update ip**
4. That's it — `landingiq.duckdns.org` now resolves to your EC2 instance

*(Optional but not required since you have a static Elastic IP: DuckDNS is normally meant for dynamic IPs that change, with a small cron script re-pinging it. Since your Elastic IP is static, you can skip that — just set it once manually as above.)*

## Step 4 — SSH in and install Docker

```bash
ssh -i your-key.pem ubuntu@<your-elastic-ip>
```

Then on the instance:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## Step 5 — Get your project onto the instance

Either clone from GitHub:
```bash
git clone https://github.com/sp4chi/landing-IQ.git
cd landing-IQ
```
or `scp` your files up directly if you haven't pushed everything yet.

Copy in the `Dockerfile`, `docker-compose.prod.yml`, and `Caddyfile` from this bundle into the project root.

## Step 6 — Edit the Caddyfile with your real DuckDNS domain

```bash
nano Caddyfile
```
Replace `landingiq.duckdns.org` with **your actual** DuckDNS subdomain from Step 3.

## Step 7 — Create your `.env` file on the server

```bash
nano .env
```
```
DATABASE_URL=your_neon_or_supabase_connection_string
SESSION_SECRET=some_long_random_string
GEMINI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://landingiq.duckdns.org/api/auth/google/callback
```
(Use your real DuckDNS domain in that last line, matching the Caddyfile.)

## Step 8 — Launch everything

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy will automatically request and install a free Let's Encrypt certificate for your DuckDNS domain
the first time it starts — no manual Certbot steps needed. Check logs if anything looks off:
```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

Visit `https://landingiq.duckdns.org` — it should load over HTTPS with a valid certificate.

## Step 9 — Update Google OAuth again

Same drill as Render: **Google Cloud Console → Credentials → your OAuth client**, add:
- Authorized JavaScript origin: `https://landingiq.duckdns.org`
- Authorized redirect URI: `https://landingiq.duckdns.org/api/auth/google/callback`

## When you buy a real domain in ~7 days

This is deliberately a two-line change:
1. At your registrar, add an **A record** pointing your new domain (or a subdomain) at the same Elastic IP.
2. On the EC2 instance:
   ```bash
   nano Caddyfile   # change the domain on the first line
   nano .env        # update GOOGLE_CALLBACK_URL to the new domain
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Update the Google OAuth Console with the new domain (same as Step 9, new URL).

Caddy will automatically get a fresh Let's Encrypt cert for the new domain — no cert management needed
on your end either time.

## Handy maintenance commands

```bash
# View app logs
docker compose -f docker-compose.prod.yml logs -f app

# Restart everything after a code change
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Check container status
docker compose -f docker-compose.prod.yml ps
```
