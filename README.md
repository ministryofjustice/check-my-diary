[![CircleCI](https://circleci.com/gh/ministryofjustice/check-my-diary/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/check-my-diary)
[![Known Vulnerabilities](https://snyk.io/test/github/ministryofjustice/check-my-diary/badge.svg)](https://snyk.io/test/github/ministryofjustice/check-my-diary)

# Check My Diary

A progressive web application for viewing shift pattern and detail. It consists of a Node.JS application
with a postgres database and calls out to Prison Officer Diary API to get shift and task information, as well as notify
to send emails and SMS.

## Cloning the Repo

```bash
git clone git@github.com:ministryofjustice/check-my-diary.git
cd check-my-diary
npm i
```
## Setting environment variables
[`template.env`](./template.env) contains all the enviroment variables need for running this app.

Ask a contributor for any values you need then rename this file to `.env`

## Build assets
`npm run build`

## Start the app.
Ensure you build assets first

`npm start`


## Running the app in "watch mode"

`npm start:dev`


## Running the app locally against local service
1. Remove any running docker containers `docker-compose down --rm all`
2. In this repository run `docker-compose up`
3. Connect to database

   ### Locally: create a local database
      1. Create database and set up required values (see docker-compose.yml)
      2. Run migration scripts to create and populate tables (\postgres-dump\*.sql)
      3. Create your account: *`INSERT INTO "UserAuthentication"("QuantumId", "EmailAddress", "Sms", "UseEmailAddress", "UseSms", "ApiUrl")VALUES ('your-name', '', '', false, false, 'https://api.check-my-diary-dev.hmpps.dsd.io/api/');`*
      4. Amend environment variables to point to local database:

         [`template.env`](./template.env) contains all the enviroment variables need for running this app.

         Add env variables from *values-dev.yaml*, modify where necessary, for example:
         - HMPPS_COOKIE_DOMAIN: *localhost:3000*
         - CHECK_MY_DIARY_URL: *http://localhost:3000*
         - CMD_API_URL: *http://localhost:3002*
         - PORT: *3000*

         Add OAuth keys (**<from kubernetes secrets>**)
         - API_CLIENT_ID:
         - API_CLIENT_SECRET:

      ### Remotely: connect to docker database to create your user

```bash
docker exec -it check-my-diary-db psql -U [DATABASE-NAME-FROM-.ENV]
INSERT INTO "UserAuthentication"("QuantumId", "EmailAddress", "Sms", "UseEmailAddress", "UseSms", "ApiUrl")VALUES ('your-name', '', '', false, false, 'https://api.check-my-diary-dev.hmpps.dsd.io/api/');
```
5. Create a tunnel into *cmd-api* because it has no ingress:

   `kubectl port-forward <cmd-api-pod number> 3002:8080 -n check-my-diary-dev`

   Note: *3002* is the port number specified in CMD_API_URL above, it could be any number you chose.

OR
5. Clone and cd into `cmd-api`
6. Run `cmd-api`
7. Start app in dev mode, in `check-my-diary` run `npm start:dev`

## Run linter

`npm run lint`

## Running tests

[Jest](https://jestjs.io/) is used to run the tests:

```bash
npm install
npm test
```

## Running integration tests

The integration tests are also run using jest, but separated out from the unit tests as they require a database and
a [wiremock](http://wiremock.org/) instance.

NB: To run integration tests you must remove your `.env` from scope so that `config.js` uses defaults

To start the docker images for the tests:

```bash
docker-compose -f docker-compose-test.yml pull && docker-compose -f docker-compose-test.yml up
```

This will start an database instance on port 5432 and a wiremock instance on port 9191 to mock out the prison officer and notify
APIs.  This allows us to simulate both services without firing them up.

The tests are written using [cypress](https://www.cypress.io/) and will test against a running application instance.
To start up the application for running the feature tests:

```bash
npm run start-feature
```

To run the tests from the command line:

```bash
npm run int-test
```

This will run all the specifications in the `integration_tests` package.

To run the tests using the cypress runner:

```bash
npm run int-test-ui
```

This will open up cypress and show all the specs.  Clicking on one of the specs will fire up chrome and run the tests in
that specification.

If the mocking is not working properly after the test has been completed then the docker terminal will show what stubs
aren't matched by requests. http://localhost:9191/__admin/requests will provide more information on the requests that
are made and http://localhost:9191/__admin/mappings will show what stubs have been created for the requests.

## Create shift data in Corporate Staff Rostering (CSR)

`Check my diary` displays shift data from `CSR`, so you need to configure access appropriately:
1. Request access to CSR
2. Map your DPS account to an existing CSR account
3. Create some shift data in CSR

Follow instructions here:
[Set up access to CSR](https://dsdmoj.atlassian.net/wiki/spaces/TI/pages/3564568692/Check+My+Diary+Onboarding)

## Updating the CMD API types

Run command:

`npx openapi-typescript http://localhost:8080/v3/api-docs --output server/@types/cmdApi/index.d.ts`

Eslint will not be happy - tidy up the generated file with Prettier.
