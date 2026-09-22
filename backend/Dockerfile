# ── Build Stage ──
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Prune dev dependencies for production
RUN npm prune --production

# ── Production Stage ──
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy runtime files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
