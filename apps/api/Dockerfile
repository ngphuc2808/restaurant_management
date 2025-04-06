FROM node:18-alpine AS base
ENV HUSKY=0
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install turbo --global
 
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN turbo prune --scope=api --docker
 
FROM base AS installer
WORKDIR /app
 
COPY .gitignore .gitignore

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/full/ .
 
RUN pnpm install --frozen-lockfile
COPY turbo.json turbo.json
RUN pnpm run prisma
RUN turbo run build --filter=api
 
FROM node:18-alpine AS runner
WORKDIR /app
 
RUN apk add --no-cache openssl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=installer --chown=nodejs:nodejs /app/apps/api/src/i18n ./apps/api/src/i18n
COPY --from=installer --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=installer --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer --chown=nodejs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=installer --chown=nodejs:nodejs /app/packages ./packages

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

USER nodejs
WORKDIR /app/apps/api
ENTRYPOINT ["/app/entrypoint.sh"]
CMD node dist/main.js