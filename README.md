# Check my diary

A progressive web application for viewing shift pattern and detail.

## Getting started
Install dependencies using `npm` ensure you are using >= `Node v8.11.3`

Ensure you have a `.env` file containing all default env variables

`cp .env-template .env`

**Starting the app**

### Build assets
`npm run build`

### Start the app.

Ensure you build assets first

`npm start`

### Runing the app in dev mode**

`npm start:dev`

### Run linter

`npm run lint`

### Run tests

`npm test`

## Or run in Docker:

This repo now contains a dockerfile. You can use this to bake a container with the following command:

`docker build -t [your_dockerhub_username]/check-my-diary .`

Then, to run it locally:

`docker run --name check-my-diary -e "API_CLIENT_ID=client" -e "API_CLIENT_SECRET=secret" -e "SESSION_SECRET=some_secret" -p 80:3000 -d [your_dockerhub_username]/check-my-diary`

You should then be able to connect to the application on localhost:80
