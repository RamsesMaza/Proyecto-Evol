FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY front/package.json front/package-lock.json ./
RUN npm install
COPY front/ .
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
RUN npx vite build

FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/package-lock.json backend/prisma/ ./
RUN npm install
COPY backend/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=frontend-builder /app/dist /front/dist
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "export DATABASE_URL=${DATABASE_URL:-$MYSQL_URL} && ./node_modules/.bin/prisma db push --accept-data-loss && ./node_modules/.bin/tsx prisma/seed.ts && (./node_modules/.bin/tsx prisma/seed-full.ts &) && exec node dist/index.js"]
