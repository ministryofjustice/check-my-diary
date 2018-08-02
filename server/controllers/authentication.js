const express = require('express');
const router = express.Router();
const session = require('../session');
const {logError: logError} = require('../logError');
const config = require('../config');
const health = require('./health');
const log = require('../log');
const gateway = require('../gateway-api');
const NotifyClient = require('notifications-node-client').NotifyClient;
const notify = new NotifyClient(process.env.NOTIFY_CLIENT_KEY || '');
const notifySmsTemplate = process.env.NOTIFY_SMS_TEMPLATE || '';
const notifyEmailTemplate = process.env.NOTIFY_EMAIL_TEMPLATE || '';

const mailTo = config.app.mailTo;
const homeLink = config.app.notmEndpointUrl;

function get2faCode() {
  return Math.floor(Math.random() * 899999 + 100000);
}

router.get('/login', async (req, res) => {
  const healthRes = await health.healthResult();
  const isApiUp = (healthRes.status < 500);
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
  const healthRes = await health.healthResult();
  const isApiUp = (healthRes.status < 500);
  log.info(`loginIndex - health check called and the isAppUp = ${isApiUp} with status ${healthRes.status}`);
  try {
    const response = await gateway.login(req);

    // @TODO: 2FA (if not on Quantum) or set cookie and login (if on Quantum)
    req.session.twoFactorCode = get2faCode();

    // For SMS
    await notify.sendSms(notifySmsTemplate, process.env.TEST_MOBILE || '', { personalisation: { '2fa_code': req.session.twoFactorCode }});

    // For email
    await notify.sendEmail(notifyEmailTemplate, process.env.TEST_EMAIL || '', { personalisation: { '2fa_code': req.session.twoFactorCode }})

    req.session.uid = req.body.username;
    req.session.cookieData = response.data;

    res.render('pages/two-factor-auth', { authError: false, csrfToken: req.csrfToken() });

  } catch (error) {
    logError(req.url, error, 'Login failure');
    let data = {
      authError: true,
      apiUp: isApiUp,
      authErrorText: getAuthErrorDescription(error),
      mailTo: mailTo,
      homeLink: homeLink,
      csrfToken: req.csrfToken()
    };

    res.render('pages/index', data);
  }
};

// @FIXME: This isn't very nice
router.post('/2fa', (req, res) => {

  if (parseInt(req.body.code, 10) === parseInt(req.session.twoFactorCode, 10)) {
    session.setHmppsCookie(res, req.session.cookieData);
    res.redirect('/');
  } else {
    logError(req.url, '2FA failure');
    res.render('pages/two-factor-auth', { authError: true, csrfToken: req.csrfToken() });
  }

});

function getAuthErrorDescription(error) {
  log.info(`login error description = ${error.response && error.response.data && error.response.data.error_description}`);
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

router.get('/logout', (req, res) => {
  session.deleteHmppsCookie(res);
  if (req.hasOwnProperty('session')) {
    req.session.uid = void 0;
  }
  res.redirect('/auth/login');
});

module.exports = {router, postLogin};
