#!/bin/sh

export $(grep -v '^#' .env.docker.dev | xargs)


npx prisma migrate deploy

exec "$@"