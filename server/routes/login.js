const asyncMiddleware = require('../middleware/asyncMiddleware')
const logError = require('../logError')
const config = require('../../config')
const health = require('../controllers/health')
const log = require('../../log')
const utilities = require('../helpers/utilities')
const staffMemberService = require('../services/staffMemberService')
const userAuthenticationService = require('../services/userAuthenticationService')
const NotifyClient = require('notifications-node-client').NotifyClient
const notify = new NotifyClient(config.notify.clientKey || '')
const notifySmsTemplate = config.notify.smsTemplateId || ''
const notifyEmailTemplate = config.notify.emailTemplateId || ''
const ipRangeCheck = require('ip-range-check')

module.exports = () => router => {

  router.get(
    '/',
    asyncMiddleware(async (req, res) => {     
      postLogin(req, res)
    })
  )
    
  router.get(
    '/auth/login',
    asyncMiddleware(async (req, res) => {
      postLogin(req, res)
    })  
  )  

  router.post('/auth/2fa', asyncMiddleware(async (req, res) => {

      if (parseInt(req.body.code, 10) === parseInt(req.user.twoFactorCode, 10)) {
          
        req.user.employeeName = await getStaffMemberEmployeeName(req.user.apiUrl, req.user.username, 
          utilities.getStartMonth(), req.user.token)
    
        await userAuthenticationService.updateUserLastLoginDateTime(req.user.username)
    
        res.redirect(`/calendar/${utilities.getStartMonth()}`)
      } else {
        logError(req.url, '2FA failure')
        res.render('pages/two-factor-auth', { authError: true, csrfToken: req.csrfToken() })
      }    
    })
  )

  const postLogin = asyncMiddleware(async (req, res) => {
        
      //if maintenance start/end dates exist then dcheck whether to display maintenance page
      //otherwise just ignore the following, it will become effective as soon as those environment
      //variables are created.  13DEC19.
      try
      {
        if (!utilities.isNullOrEmpty(config.maintenance.start) && !utilities.isNullOrEmpty(config.maintenance.end)) {    
        
          var maintenanceStartDateTime = Date.parse(config.maintenance.start) ? new Date(config.maintenance.start) : null
          var maintenanceEndDateTime = Date.parse(config.maintenance.end) ? new Date(config.maintenance.end) : null

          if (utilities.calculateMaintenanceDates(maintenanceStartDateTime, maintenanceEndDateTime)){
            res.render('pages/maintenance', {
              startDateTime: maintenanceStartDateTime,
              endDateTime: maintenanceEndDateTime
            })
            return
          }
        } 
      }
      catch(error){
        logError(req.url, data, 'Login failure')
      }  

      const ipAddress = req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null)
    
      log.info(`Ip Address : ${ipAddress}`)
      log.info(`Quantum Address : ${config.quantumAddresses}`)
      
      var healthRes
      var isApiUp
      
      try {
    
        var userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)
    
        if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
          throw new Error('Error : No Sms or Email address returned for QuantumId : ' + req.user.username)
        }
    
        var userAuthentication = userAuthenticationDetails[0]
    
        // Add Api health check
        healthRes = await health.healthResult([`${userAuthentication.ApiUrl}health`, `${userAuthentication.ApiUrl}health/invision`])
        isApiUp = (healthRes.status === 200)
        log.info(`loginIndex - health check called and the isAppUp = ${isApiUp} with status ${healthRes.status}`)
        log.info(`${userAuthentication.ApiUrl}health - health check with status ${healthRes.status}`)
    
        if (isApiUp === false) {
          res.render('pages/index', {
            authError: false,
            apiUp: isApiUp,        
            csrfToken: req.csrfToken()
          })
          return
        }
    
        var quantumAddresses = config.quantumAddresses.split(',')
    
        if (config.twoFactorAuthOn === 'true' && ipRangeCheck(ipAddress, quantumAddresses) === false)
        {
          if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
            throw new Error('Error : No Sms or Email address returned for QuantumId : ' + req.user.username)
          }
    
          var userAuthentication = userAuthenticationDetails[0]
    
          if ((userAuthentication.EmailAddress === null || userAuthentication.EmailAddress === '')
              && (userAuthentication.Sms === null || userAuthentication.Sms === '')) {
            throw new Error('Error : Sms or Email address null or empty for QuantumId : ' + req.user.username)
          }
    
          var emailEnabled = userAuthentication.UseEmailAddress
          var smsEnabled = userAuthentication.UseSms
    
          if ((!emailEnabled && !smsEnabled)) {
            throw new Error('Error : Sms or Email address both set to false for QuantumId : ' + req.user.username)
          }
    
          // @TODO: 2FA (if not on Quantum) or set cookie and login (if on Quantum)
          req.user.twoFactorCode = utilities.get2faCode()
          
          if (smsEnabled) {
            // For SMS
            await notify.sendSms(notifySmsTemplate, userAuthentication.Sms || '', { personalisation: { '2fa_code': req.user.twoFactorCode }})
            .then(response => smsSend = true)
            .catch(err => { throw new Error(err)})
          }
          
          if (emailEnabled) {
            // For email
            await notify.sendEmail(notifyEmailTemplate, userAuthentication.EmailAddress || '', { personalisation: { '2fa_code': req.user.twoFactorCode }})
            .then(response => emailSent = true)
            .catch(err => { throw new Error(err)})
          }
            
          req.user.apiUrl = userAuthentication.ApiUrl
          req.user.sessionExpires = new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000)
          
          res.render('pages/two-factor-auth', { authError: false, csrfToken: req.csrfToken() })
    
        } else {
    
          req.user.apiUrl = userAuthentication.ApiUrl
          req.user.sessionExpires = new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000)
        
          req.user.employeeName = await getStaffMemberEmployeeName(req.user.apiUrl, req.user.username, 
            utilities.getStartMonth(), req.user.token)
    
          await userAuthenticationService.updateUserLastLoginDateTime(req.user.username)
    
          res.redirect(`/calendar/${utilities.getStartMonth()}`)
        }
      } catch (error) {
            
        let data = {
          id : req.user.username,
          authError: true,
          apiUp: isApiUp,
          authErrorText: utilities.getAuthErrorDescription(error),
          csrfToken: req.csrfToken()
        }
    
        logError(req.url, data, 'Login failure')
    
        res.render('pages/index', data)
      }
    })

    return router
}

async function getStaffMemberEmployeeName(apiUrl, uid, startMonth, accessToken) {

  var staffMemberResponse = await staffMemberService.getStaffMemberData(apiUrl, uid, startMonth, accessToken)

  if (staffMemberResponse !== null) {
    return staffMemberResponse.staffMembers[0].employeeName
  } else {
      return null
  }
}


