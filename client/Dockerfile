FROM node:16-alpine 

WORKDIR /app

COPY ./client .

ADD ./server/common/ ../server/common/

RUN npm ci 

RUN npm run build


ENV NODE_ENV production

EXPOSE 3000
# Start the app
CMD [ "npx", "serve", "build" ]