FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
COPY ./src ./src
COPY ./postgres ./postgres
COPY ./drizzle.config.ts ./drizzle.config.ts
COPY ./drizzle.migrate.config.ts ./drizzle.migrate.config.ts
COPY ./tsconfig.json ./tsconfig.json

RUN pnpm i
RUN pnpm build

FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/postgres ./postgres
COPY --from=builder /app/drizzle.migrate.config.ts ./drizzle.migrate.config.ts

EXPOSE 7778

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
