# Stage: base image
FROM node:16-14-bullseye-slim as base
ARG BUILD_NUMBER
ARG GIT_REF

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl

# Stage: build assets
FROM base as build
ARG BUILD_NUMBER
ARG GIT_REF

RUN apt-get install -y make python wget gnupg gnupg1 gnupg2 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit

COPY . .

RUN npm run build

ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}
ENV GIT_REF ${GIT_REF:-dummy}
RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --no-audit --production

# Stage: copy production assets and dependencies
FROM base

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Install AWS RDS Root cert
RUN curl https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem > /app/root.cert

COPY --from=build --chown=appuser:appgroup /app .

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV='production'
USER 2000

CMD [ "npm", "start" ]
