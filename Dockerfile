FROM node:8
RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

RUN mkdir -p /app
WORKDIR /app
ADD . .
COPY package.json /app
RUN chown -R appuser:appgroup /app
USER 2000
RUN npm install
CMD npm start
EXPOSE 3000
