FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# --------- Dependencies -------
FROM base AS deps

RUN pnpm install --frozen-lockfile

# ------- Build ------
FROM base AS build

ENV CI=true
    
COPY --from=deps /app/node_modules ./node_modules
COPY . .
        
RUN pnpm install --frozen-lockfile && pnpm run build && cp -r src/generated dist/generated


# ------ Production ------
FROM base AS production

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]