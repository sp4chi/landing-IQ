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
# (this is exactly what was missing on Render's default container)
RUN apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libasound2 \
    libatspi2.0-0 libxshmfence1 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Install Playwright's Chromium binary explicitly (matches the earlier Render fix)
RUN npx playwright install --with-deps chromium

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
