FROM node:8
WORKDIR /app
COPY package.json /app
USER node
RUN npm install && \
    npm config set prefix /app/npm
ENV PATH="$PATH:/app/npm/bin"
ENV NODE_PATH="$NODE_PATH:/app/npm/lib/node_modules"
COPY . /app
CMD npm start
EXPOSE 3000
