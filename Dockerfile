FROM node:8
USER node
RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN npm install && \
    npm config set prefix /app/npm
ENV PATH="$PATH:/app/npm/bin"
ENV NODE_PATH="$NODE_PATH:/app/npm/lib/node_modules"
COPY . /app
CMD npm start
EXPOSE 3000
