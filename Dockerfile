FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/cloudrun-server.mjs ./cloudrun-server.mjs
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
CMD ["node", "cloudrun-server.mjs"]