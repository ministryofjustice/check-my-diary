FROM node:8
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3000
USER 1001
CMD npm start
