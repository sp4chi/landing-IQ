# Use official Microsoft Playwright image with Linux Chromium dependencies & fonts pre-installed
FROM mcr.microsoft.com/playwright:v1.42.0-jammy

WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build Vite frontend production bundle
RUN npm run build

# Build TypeScript server if needed or ensure production env
ENV PORT=3000
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=0

EXPOSE 3000

# Start Express server with tsx in production mode
CMD ["npx", "tsx", "server/index.ts"]
