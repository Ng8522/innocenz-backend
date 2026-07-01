FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

COPY package.json ./
COPY ./src ./src
COPY ./postgres ./postgres
COPY ./drizzle.config.ts ./drizzle.config.ts
COPY ./drizzle.migrate.config.ts ./drizzle.migrate.config.ts
COPY ./tsconfig.json ./tsconfig.json

RUN pnpm install
RUN pnpm build

FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/postgres ./postgres
COPY --from=builder /app/drizzle.migrate.config.ts ./drizzle.migrate.config.ts

EXPOSE 7780

HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:7780/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
