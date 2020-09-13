FROM node:14.4.0-alpine3.11 as builder

WORKDIR /app

COPY package.json package-lock.json /app/
RUN set -ex \
  && apk add --no-cache \
    util-linux \
  && npm i
COPY src/ /app/src
RUN NODE_ENV=production npm run prod

FROM nginx:1.19.2-alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html
