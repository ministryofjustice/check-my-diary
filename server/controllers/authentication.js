const express = require('express');
const router = express.Router();
const session = require('../session');
const {logError: logError} = require('../logError');
const config = require('../config');
const health = require('./health');
const log = require('../log');
const gateway = require('../gateway-api');
const staffMemberService = require('../services/staffMemberService');
const userAuthenticationService = require('../services/userAuthenticationService');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notify = new NotifyClient(process.env.NOTIFY_CLIENT_KEY || '');
const notifySmsTemplate = process.env.NOTIFY_SMS_TEMPLATE || '';
const notifyEmailTemplate = process.env.NOTIFY_EMAIL_TEMPLATE || '';
const apiAuthUrl = process.env.API_AUTH_ENDPOINT_URL || 'http://localhost:8080/';
const apiNotifyUrl = process.env.NOTIFY_HEALTH_CHECK_URL || 'https://api.notifications.service.gov.uk/_status';

const mailTo = config.app.mailTo;
const homeLink = config.app.notmEndpointUrl;

/**
 * Gets a simple 6-digit code for 2FA
 * @returns {number}
 */
function get2faCode() {
  return Math.floor(Math.random() * 899999 + 100000);
}

/**
 * Gets the current month as a date string (YYYY-MM-DD)
 * @returns {string}
 */
function getStartMonth() {
  const now = new Date();
  return [now.getFullYear(), ('0' + (now.getMonth() + 1)).slice(-2), '01'].join('-');
}

router.get('/login', async (req, res) => {
  const healthRes = await health.healthResult([apiAuthUrl, apiNotifyUrl]);
  const isApiUp = (healthRes.status === 200);
  log.info(`loginIndex - health check called and the isAppUp = ${isApiUp} with status ${healthRes.status}`);
 
  res.render('pages/index', {
    authError: false,
    apiUp: isApiUp,
    mailTo: mailTo,
    homeLink: homeLink,
    csrfToken: req.csrfToken(),
    uid: req.session.uid
  });
});

router.post('/login', (req, res) => {
  postLogin(req, res);
});

const postLogin = async (req, res) => {

  const ipAddress = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);

  log.info(`Ip Address : ${ipAddress}`);
  log.info(`Quantum Address : ${process.env.QUANTUM_ADDRESS}`);
  
  var healthRes;
  var isApiUp;  
  
  try {

    log.info(`NOMIS Login : ${req.body.username}`);

    const response = await gateway.login(req);

    log.info(`Successful NOMIS Login`);

    var userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.body.username);

    if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
      throw new Error('Error : No Sms or Email address returned for QuantumId : ' + req.body.username);
    }

    var userAuthentication = userAuthenticationDetails[0];

    // Add Api health check
    healthRes = await health.healthResult([`${userAuthentication.ApiUrl}health`, `${userAuthentication.ApiUrl}health/invision`]);
    isApiUp = (healthRes.status === 200);
    log.info(`loginIndex - health check called and the isAppUp = ${isApiUp} with status ${healthRes.status}`);
    log.info(`${userAuthentication.ApiUrl}health - health check with status ${healthRes.status}`);

    if (isApiUp === false) {
      res.render('pages/index', {
        authError: false,
        apiUp: isApiUp,        
        csrfToken: req.csrfToken()
      });
      return;
    }

    var quantumAddresses = process.env.QUANTUM_ADDRESS.split(',');

    if (process.env.TWO_FACT_AUTH_ON === 'true' && quantumAddresses.includes(ipAddress) === false)
    {
      if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
        throw new Error('Error : No Sms or Email address returned for QuantumId : ' + req.body.username);
      }

      var userAuthentication = userAuthenticationDetails[0];

      if ((userAuthentication.EmailAddress === null || userAuthentication.EmailAddress === '')
          && (userAuthentication.Sms === null || userAuthentication.Sms === '')) {
        throw new Error('Error : Sms or Email address null or empty for QuantumId : ' + req.body.username);
      }

      var emailEnabled = userAuthentication.UseEmailAddress;
      var smsEnabled = userAuthentication.UseSms;

      if ((!emailEnabled && !smsEnabled)) {
        throw new Error('Error : Sms or Email address both set to false for QuantumId : ' + req.body.username);
      }

      // @TODO: 2FA (if not on Quantum) or set cookie and login (if on Quantum)
      req.session.twoFactorCode = get2faCode();

      if (smsEnabled) {
        // For SMS
        await notify.sendSms(notifySmsTemplate, userAuthentication.Sms || '', { personalisation: { '2fa_code': req.session.twoFactorCode }});
      }

      if (emailEnabled) {
        // For email
        await notify.sendEmail(notifyEmailTemplate, userAuthentication.EmailAddress || '', { personalisation: { '2fa_code': req.session.twoFactorCode }})
      }

      req.session.uid = req.body.username;
      req.session.cookieData = response.data;
      req.session.apiUrl = userAuthentication.ApiUrl;
      
      res.render('pages/two-factor-auth', { authError: false, csrfToken: req.csrfToken() });

    } else {

      req.session.uid = req.body.username;
      req.session.cookieData = response.data;
      req.session.apiUrl = userAuthentication.ApiUrl;
      
      session.setHmppsCookie(res, req.session.cookieData);

      req.session.employeeName = await getStaffMemberEmployeeName(req.session.apiUrl, req.session.uid, 
                                      getStartMonth(), req.session.cookieData.access_token);

      await userAuthenticationService.updateUserLastLoginDateTime(req.session.uid);

      res.redirect(`/calendar/${getStartMonth()}`);
    }
  } catch (error) {
        
    let data = {
      id : req.body.username,
      authError: true,
      apiUp: isApiUp,
      authErrorText: getAuthErrorDescription(error),
      mailTo: mailTo,
      homeLink: homeLink,
      csrfToken: req.csrfToken()
    };

    logError(req.url, data, 'Login failure');

    res.render('pages/index', data);
  }
};

// @FIXME: This isn't very nice
router.post('/2fa', async (req, res) => {

  if (parseInt(req.body.code, 10) === parseInt(req.session.twoFactorCode, 10)) {
    session.setHmppsCookie(res, req.session.cookieData);

    req.session.employeeName = await getStaffMemberEmployeeName(req.session.apiUrl, req.session.uid, 
                                        getStartMonth(), req.session.cookieData.access_token);

    await userAuthenticationService.updateUserLastLoginDateTime(req.session.uid);

    res.redirect(`/calendar/${getStartMonth()}`);
  } else {
    logError(req.url, '2FA failure');
    res.render('pages/two-factor-auth', { authError: true, csrfToken: req.csrfToken() });
  }

});

function getAuthErrorDescription(error) {
  log.info(`login error description = ${error}`);
  log.info(`login response error description = ${error.response && error.response.data && error.response.data.error_description}`);
  let type = 'The username or password you have entered is invalid.';
  if (error.response && error.response.data && error.response.data.error_description) {
    if (error.response.data.error_description.includes('ORA-28000')) {
      type = 'Your user account is locked.';
    } else if (error.response.data.error_description.includes('does not have access to caseload NWEB')) {
      type = 'You are not enabled for this service, please contact admin and request access.';
    } else if (error.response.data.error_description.includes('ORA-28001')) {
      type = 'Your password has expired.';
    }
  }
  return type;
}

async function getStaffMemberEmployeeName(apiUrl, uid, startMonth, accessToken) {

  var staffMemberResponse = await staffMemberService.getStaffMemberData(apiUrl, uid, startMonth, accessToken);

  if (staffMemberResponse !== null) {
    return staffMemberResponse.staffMembers[0].employeeName;
  } else {
      return null;
  }
}

router.get('/logout', (req, res) => {
  session.deleteHmppsCookie(res);
  if (req.hasOwnProperty('session')) {
    req.session.uid = void 0;
  }
  res.redirect('/auth/login');
});

module.exports = {router, postLogin};
