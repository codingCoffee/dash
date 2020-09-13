FROM node:14.4.0-alpine3.11

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production
COPY server.js .

EXPOSE 3000
ENV APP_HOST "0.0.0.0"

CMD [ "npm", "run", "prod" ]
