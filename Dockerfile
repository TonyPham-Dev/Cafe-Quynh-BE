FROM node:20.14.0-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/app/.cache/node_modules npm install

COPY .env.example .env

RUN yarn prisma generate

EXPOSE 3030

CMD [ "yarn", "dev" ]

