[![CircleCI](https://circleci.com/gh/ministryofjustice/check-my-diary/tree/master.svg?style=svg)](https://circleci.com/gh/ministryofjustice/check-my-diary)
[![Known Vulnerabilities](https://snyk.io/test/github/ministryofjustice/check-my-diary/badge.svg)](https://snyk.io/test/github/ministryofjustice/check-my-diary)

# Check My Diary

A progressive web application for viewing shift pattern and detail. It consists of a Node.JS application
with a postgres database and calls out to Prison Officer Diary API to get shift and task information, as well as notify
to send emails and SMS.

## Cloning the Repo

```bash
git clone git@github.com:ministryofjustice/check-my-diary.git
cd check-my-diary
```
## Build assets
`npm run build`

## Start the app.
Ensure you build assets first

`npm start`

## Running the app in dev mode

`npm start:dev`

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

To start the docker images for the tests:

```bash
npm run docker-compose:int
```

This will start an database instance on port 5432 and a wiremock instance on port 9191 to mock out the prison officer and notify
APIs.  This allows us to simulate both services without firing them up.

The tests are written using [cypress](https://www.cypress.io/) and will test against a running application instance.
To start up the application for running the feature tests:

```bash
npm run start:int
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

