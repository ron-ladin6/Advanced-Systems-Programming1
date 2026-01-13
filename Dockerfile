FROM gcc:latest AS ex2
RUN apt-get update && apt-get install -y cmake git python3 \
    && ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /usr/src/my_project
COPY . .
RUN mkdir -p storage
ENV FILES_BASE_PATH="/usr/src/my_project/storage"
RUN rm -rf build && cmake -S . -B build && cmake --build build \
    && mkdir -p build/src && cp src/python_client.py build/src/
WORKDIR /usr/src/my_project/build
EXPOSE 8080
CMD ["./ServerMain", "8080"]


FROM node:18-alpine AS web
WORKDIR /app
COPY node/package*.json ./
RUN npm install
COPY node/ ./
EXPOSE 5000
CMD ["node", "src/server.js"]

FROM node:18-alpine AS frontend
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ .
EXPOSE 3000
CMD ["npm", "start"]