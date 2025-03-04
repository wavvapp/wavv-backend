FROM node:20.17

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g pnpm
RUN pnpm install

COPY . .

ARG NODE_ENV
ARG DATABASE_URL


ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production

RUN pnpm run build

RUN pnpm run migration:run

EXPOSE 8000
CMD ["node", "dist/index.js"]
