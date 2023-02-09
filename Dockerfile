FROM nikolaik/python-nodejs:python3.10-nodejs16 as builder

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
ENV NODE_ENV="production"
COPY . .
RUN pnpm build
CMD [ "pnpm", "start" ]