FROM node:16-alpine 

WORKDIR /app


RUN npm config set unsafe-perm true

RUN npm install -g typescript
RUN npm install -g ts-node

USER node

COPY --chown=node:node . .

RUN npm install


EXPOSE 3001
# Start the app
CMD [ "npx", "nodemon", "index.ts" ]