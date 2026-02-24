# ==========================================
# Empliq Backend — Production Dockerfile
# Multi-stage build for NestJS + Prisma
# ==========================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy built output + production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]
