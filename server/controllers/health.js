const axios = require('axios'),
  apiUrl = process.env.API_ENDPOINT_URL || 'http://localhost:8080/',
  apiAuthUrl = process.env.API_AUTH_ENDPOINT_URL || 'http://localhost:8080/',
  applicationVersion = require('../application-version'),
  packageData = applicationVersion.packageData,
  buildVersion = applicationVersion.buildNumber;

const getHealth = (uri) => axios.get(`${uri}health`, {timeout: 2000});

const reflect = (promise) => promise.then(
  response => ({data: response.data, status: response.status}),
  error => {
    if (error.response) {
      return {data: error.response.data, status: error.response.status};
    }
    return {data: error.message, status: 500};
  }
);

const healthResult = async () => {
  let status;

  const appInfo = {
    name: packageData.name,
    version: buildVersion,
    description: packageData.description,
    uptime: process.uptime()
  };

  const serviceUris = [
    apiUrl,
    apiAuthUrl
  ];

  try {
    const results = await Promise.all(serviceUris.map(getHealth).map(reflect));
    status = results.reduce((status, health) => Math.max(status, health.status), 200);
  } catch (error) {
    appInfo.api = error.message;
    status = (error.response && error.response.status) || 500;
  }
  return {appInfo, status};
};

module.exports = {healthResult, apiUrl, apiAuthUrl};
