# Hamravesh mirror (Iran): https://repo.hmirror.ir/npm
# Do not use corepack prepare — it fetches pnpm from registry.npmjs.org before mirror applies
FROM node:22-bookworm-slim AS base

ENV NPM_REGISTRY=https://repo.hmirror.ir/npm
ENV COREPACK_NPM_REGISTRY=${NPM_REGISTRY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV npm_config_registry=${NPM_REGISTRY}
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

# pnpm install config (registry, retries, timeouts) comes from the project
# .npmrc copied in the deps stage — no global `pnpm config set` needed.
RUN npm config set registry "${NPM_REGISTRY}" \
  # The Iran mirror intermittently 404s on a package that does exist (transient
  # proxy hiccup); npm treats a 404 as final and never retries, so retry by hand.
  && (for i in 1 2 3 4 5; do npm install -g pnpm@11.5.2 && exit 0; sleep 5; done; exit 1)

WORKDIR /app

FROM base AS deps

ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm config get registry \
  && pnpm install --frozen-lockfile --registry "${NPM_REGISTRY}"

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_BACKEND_ORIGIN
ARG NEXT_PUBLIC_BACKEND_API_PATH
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ADMIN_PANEL_URL

ENV NEXT_PUBLIC_BACKEND_ORIGIN=${NEXT_PUBLIC_BACKEND_ORIGIN}
ENV NEXT_PUBLIC_BACKEND_API_PATH=${NEXT_PUBLIC_BACKEND_API_PATH}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ADMIN_PANEL_URL=${NEXT_PUBLIC_ADMIN_PANEL_URL}

RUN pnpm run build

FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 5000
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/',(r)=>process.exit(r.statusCode&&r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
