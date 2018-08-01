const axios = require('axios');
const apiUrl = process.env.API_ENDPOINT_URL || 'http://localhost:8080/';
const applicationVersion = require('../application-version');

const packageData = applicationVersion.packageData;
const buildVersion = applicationVersion.buildNumber;

const healthResult = async () => {
  let status;

  const appInfo = {
    name: packageData.name,
    version: buildVersion,
    description: packageData.description,
    uptime: process.uptime()
  };

  try {
    const result = await axios.get(`${apiUrl}api/health`, { timeout: 2000 });
    status = result.status;
  } catch (error) {
    appInfo.api = error.message;
    status = (error.response && error.response.status) || 500;
  }
  return { appInfo, status };
};

module.exports = { healthResult };
