# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

# Generate Prisma Client (prisma.config.ts must be present)
RUN npx prisma generate

COPY . .

RUN npm run build

# Verify build output exists
RUN ls -la dist/ && test -f dist/main.js

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install production dependencies + prisma CLI for migrate deploy
RUN npm ci --omit=dev && npm cache clean --force
RUN npm install prisma@7.3.0

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Verify dist was copied correctly
RUN ls -la dist/ && test -f dist/main.js

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
