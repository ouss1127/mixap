FROM node:18.18.2-alpine

WORKDIR /app
COPY package.json ./
RUN yarn install  --network-timeout 500000
COPY . .

EXPOSE 3000
CMD ["dev"]

