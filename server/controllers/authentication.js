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
var ipRangeCheck = require("ip-range-check");

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

function isNullOrEmpty( str ) {
  if (typeof str == 'undefined' || !str || str.length === 0 || str === '' || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,'') === '')
    {
        return true
    }
    else
    {
        return false
    }
}

function areDatesTheSame (date1, date2) {
  return (date1.getFullYear() === date2.getFullYear()) &&
         // getMonth is 0-indexed
         (date1.getMonth() === date2.getMonth()) &&
         (date1.getDate() == date2.getDate());
}

router.get('/login', async (req, res) => {
  const healthRes = await health.healthResult([apiAuthUrl, apiNotifyUrl]);
  const isApiUp = (healthRes.status === 200);
  log.info(`loginIndex - health check called and the isAppUp = ${isApiUp} with status ${healthRes.status}`);

  var showMaintenancePage = false;
  var currentDateTime = new Date();

  //if maintenance start/end dates exist then dcheck whether to display maintenance page
  //otherwise just ignore the following, it will become effective as soon as those environment
  //variables are created.  13DEC19.
  try
  {
    if (isNullOrEmpty(process.env.MAINTENANCE_START) && isNullOrEmpty(process.env.MAINTENANCE_END))
    {
      res.render('pages/index', {
        authError: false,
        apiUp: isApiUp,
        mailTo: mailTo,
        homeLink: homeLink,
        csrfToken: req.csrfToken(),
        uid: req.session.uid
      });
      return;

    } else {
    
      var maintenanceStartDateTime = Date.parse(process.env.MAINTENANCE_START) ? new Date(process.env.MAINTENANCE_START) : null;
      var maintenanceEndDateTime = Date.parse(process.env.MAINTENANCE_END) ? new Date(process.env.MAINTENANCE_END) : null;

      if (maintenanceEndDateTime !== null){
        showMaintenancePage = (currentDateTime >= maintenanceStartDateTime && currentDateTime <= maintenanceEndDateTime) ? true: false;
      } else{
        showMaintenancePage = (areDatesTheSame(currentDateTime, maintenanceStartDateTime));
      }

      if (showMaintenancePage){
        res.render('pages/maintenance', {
          startDateTime: maintenanceStartDateTime,
          endDateTime: maintenanceEndDateTime
        });
        return;
      } else {
        res.render('pages/index', {
          authError: false,
          apiUp: isApiUp,
          mailTo: mailTo,
          homeLink: homeLink,
          csrfToken: req.csrfToken(),
          uid: req.session.uid
        });
        return;
      }
    } 
  }
  catch(error){
    logError(req.url, data, 'Login failure');
  }  
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

    if (process.env.TWO_FACT_AUTH_ON === 'true' && ipRangeCheck(ipAddress, quantumAddresses) === false)
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

      var emailSent = false;
      var smsSent = false;
      
      if (smsEnabled) {
        // For SMS
        await notify.sendSms(notifySmsTemplate, userAuthentication.Sms || '', { personalisation: { '2fa_code': req.session.twoFactorCode }})
        .then(response => smsSend = true)
        .catch(err => { throw new Error(err)});
      }
      
      if (emailEnabled) {
        // For email
        await notify.sendEmail(notifyEmailTemplate, userAuthentication.EmailAddress || '', { personalisation: { '2fa_code': req.session.twoFactorCode }})
        .then(response => emailSent = true)
        .catch(err => { throw new Error(err)});
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
    if (error.response.data.error_description.includes('No credentials provided')) {
      type = "The username or password you have entered is invalid."
    } else if (error.response.data.error_description.includes('Bad credentials')) {
      type = "The username you have entered is invalid."
    } else if (error.response.data.error_description.includes('password does not match stored value')) {
      type = "The password you have entered is invalid."
    } else if (error.response.data.error_description.includes('User account is locked')) {
      type = "Your NOMIS account is locked. Please contact your Local Systems Admin or the NOMIS support team."    
    } else if (error.response.data.error_description.includes('User credentials have expired')) {
      type = "Your NOMIS account has expired. Please contact your Local Systems Admin or the NOMIS support team."          
    }
  } else if (error !== null && error.message !== '') {
    if (error.message.includes('No Sms or Email address returned for QuantumId')) {
      type = "You have not been setup on Check My Diary. Please contact us via: checkmydiary@digital.justice.gov.uk if you would like to be included."
    } else if (error.message.includes('Sms or Email address null or empty for QuantumId')) {
      type = "You have not been setup with a email address or mobile number. Please contact us via: checkmydiary@digital.justice.gov.uk."
    } else if (error.message.includes('Sms or Email address both set to false for QuantumId')) {
      type = "Your email address or mobile number has not been enabled. Please contact us via: checkmydiary@digital.justice.gov.uk."      
    } else if (error.message.includes('email_address Not a valid email address')) {
      //type = "Your email address or mobile number stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk." 
      type = "Your email address stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk." 
    } else if (error.message.includes('phone_number Not enough digits') 
                    || error.message.includes('phone_number Must not contain letters or symbols')
                    || error.message.includes('phone_number Too many digits')) {
      type = "Your mobile number stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk."       
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
