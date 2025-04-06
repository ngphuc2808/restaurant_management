#!/bin/sh

export $(grep -v '^#' .env.dev.docker | xargs)


npx prisma migrate deploy

exec "$@"