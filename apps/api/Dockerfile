# Build stage
FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build api --configuration=production

# Production stage
FROM node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=build /app/dist/apps/api .
COPY --from=build /app/node_modules ./node_modules

CMD [ "node", "main.js" ]
