### Setup Wiremock

Running `docker compose up` from the `/wiremock` directory will run the wiremock server on port 8080.

#### Configured Stubs

The active stubs can be view at http://localhost:8080/__admin/mappings and requests made to the server can be seen at http://localhost:8080/__admin/requests

1. Health Ping - GET http://localhost:8080/health/ping
2. Notification Preferences - GET http://localhost:8080/preferences/notifications
3. Snooze Notification - PUT http://localhost:8080/preferences/notifications/snooze
4. User Shift Details - GET http://localhost:8080/user/details?from={fromDate}&to={toDate}
5. Notification Details - PUT http://localhost:8080/preferences/notifications/details
6. Notifications - GET http://localhost:8080/notifications
