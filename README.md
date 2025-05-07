## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run dev

# production mode
$ yarn run prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## create controller, service, dto, modules
```bash
## create modules on path src/modules/cats.modules.ts
$ nest g se cats modules --flat
## create controller on path src/controllers/cats.controller.ts
$ nest g co cats controllers --flat
## create service on path src/services/cats.service.ts
$ nest g s cats services --flat
## create dto on path src/dtos/cats.dto.ts
$ nest g cl cats.dto dtos --flat
```

## Run prisma
```bash
## migrate database
$ npx prisma migrate dev
## generate prisma client
$ npx prisma generate
## push struct to database
$ npx prisma db push
## pull struct from database
$ npx prisma db pull
## reset database
$ npx prisma migrate reset
## create migration
$ npx prisma migrate dev --name init
## apply migration
$ npx prisma migrate deploy

## prisma studio
$ npx prisma studio
```

## Run with docker compose
```bash
$ docker-compose up -d --build
```


