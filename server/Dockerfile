FROM node:16-alpine 

WORKDIR /app


COPY . .

RUN npm i -g typescript

RUN npm i

RUN tsc index.ts


EXPOSE 3001
# Start the app
CMD [ "node", "index.js" ]