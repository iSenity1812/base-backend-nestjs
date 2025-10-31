# ----------------------------
# Builder: install deps and build
# ----------------------------
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
# Enable corepack and pnpm
RUN corepack enable

# Install dependencies (cached by lockfile)
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ----------------------------
# Runner: production image
# ----------------------------
FROM node:22-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN corepack enable

# Copy production artifacts
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json ./package.json
COPY config ./config

# Port from config/default.js
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
