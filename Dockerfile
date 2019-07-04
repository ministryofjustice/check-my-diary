FROM node:8
WORKDIR /app
COPY package.json /app
RUN adduser --disabled-password node -u 1001
USER node
RUN npm install && \
    npm config set prefix /app/npm
ENV PATH="$PATH:/app/npm/bin"
ENV NODE_PATH="$NODE_PATH:/app/npm/lib/node_modules"
COPY . /app
CMD npm start
EXPOSE 3000
