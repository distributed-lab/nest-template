FROM node:18.14.2 as build

WORKDIR /app

COPY . ./
RUN npm i -g @vercel/ncc pkg && yarn && yarn build && ncc build ./dist/apps/api/main.js && pkg -t node18-alpine-x64 ./dist/index.js  -o /usr/local/bin/api

FROM alpine:3.9

COPY --from=build /usr/local/bin/api /usr/local/bin/api

EXPOSE 3000
ENTRYPOINT ["api"]
