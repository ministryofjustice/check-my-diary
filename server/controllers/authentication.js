const express = require('express');
const router = express.Router();
const session = require('../session');
const {logError: logError} = require('../logError');
const config = require('../config');
const health = require('./health');
const log = require('../log');
const gateway = require('../gateway-api');

const mailTo = config.app.mailTo;
const homeLink = config.app.notmEndpointUrl;

router.get('/login', async (req, res) => {
  const healthRes = await health.healthResult();
  const isApiUp = (healthRes.status < 500);
  log.info(`loginIndex - health check called and the isAppUp = ${isApiUp}`);
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

// @TODO: Switch this to the 2FA (if not on Quantum) and use this after the 2FA
const postLogin = async (req, res) => {
  const healthRes = await health.healthResult();
  const isApiUp = (healthRes.status < 500);
  log.info(`loginIndex - health check called and the isAppUp = ${isApiUp}`);
  try {
    const response = await gateway.login(req);
    session.setHmppsCookie(res, response.data);
    req.session.uid = req.body.username;
    res.redirect('/');
  } catch (error) {
    logError(req.url, error, 'Login failure');
    let data = {
      authError: true,
      apiUp: isApiUp,
      authErrorText: getAuthErrorDescription(error),
      mailTo: mailTo,
      homeLink: homeLink,
      csrfToken: req.csrfToken(),
      uid: req.session.uid
    };

    res.render('pages/index', data);
  }
};

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
