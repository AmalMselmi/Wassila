# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
WORKDIR /app
RUN chown node:node /app

# ---- dependencies (including dev tools) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- development image (used by docker-compose) ----
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ---- production dependencies only ----
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- production image (validated in Phase 7) ----
FROM base AS prod
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]