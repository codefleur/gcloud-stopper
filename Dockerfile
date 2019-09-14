FROM node:12-alpine
ENV MAX_PING_DELTA=1800
WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT node index.js