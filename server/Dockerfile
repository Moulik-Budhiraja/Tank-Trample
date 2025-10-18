FROM node:16-alpine 

WORKDIR /app


# Copy server sources
COPY ./server .

# Install dependencies (will also install @types/node from package.json)
RUN npm i

# Build with project tsconfig
RUN npx tsc -p .


EXPOSE 3001
# Start compiled output from dist
CMD [ "node", "dist/index.js" ]