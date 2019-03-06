# Check my diary

A progressive web application for viewing shift pattern and detail.

## Getting started
Install dependencies using `yarn` ensure you are using >= `Node v8.11.3`

Ensure you have a `.env` file containing all default env variables

`cp .env-template .env`

**Starting the app**

### Build assets
`yarn build`

### Start the app.

Ensure you build assets first

`yarn start`

### Runing the app in dev mode**

`yarn start:dev`

### Run linter

`yarn lint`

### Run tests

`yarn test`

## Or run in Docker:

This repo now contains a dockerfile. You can use this to bake a container with the following command:
`docker build -t [your_dockerhub_username]/check-my-diary .`

Then, to run it locally:
`docker run --name check-my-diary -p 80:3000 -d [your_dockerhub_username]/check-my-diary`
You should then be able to connect to the application on localhost:80
