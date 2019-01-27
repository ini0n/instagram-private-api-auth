const Exceptions = require('./lib/Exceptions')
const Logger = require('./lib/Logger')
const readCodeFromConsole = require('./lib/ConsoleReader')

const log = new Logger('AuthService', ['info', 'debug', 'warn', 'error'])

module.exports.AuthService = function(Client) {
    let username = null
    let password = null
    let device = null
    let storage = null
    let session = null
    let checkpointErrorCounter = 0

    async function createUserSession(_username, _password, isFirst = true) {
        try {
            username = _username
            password = _password

            if (isFirst === true) {
                log.info('Generate device and storage...')
                device = new Client.Device(username)
                storage = new Client.CookieFileStorage(`storage/${username}.json`)
                checkpointErrorCounter = 0
            }
            
            log.info('Creating user session...')
            session = await Client.Session.create(device, storage, username, password)

            return session
        } catch (error) {
            log.error(error.name)

            if (session === null) {
                log.info('Session is empty, creating Session with device and storage')
                session = await new Client.Session(device, storage)
            }

            if (error.name === 'CheckpointError') {
                checkpointErrorCounter++
                if (checkpointErrorCounter > 1) {
                    log.error('Checkpoint endless loop..')
                    return new Exceptions.CheckpointEndlessLoopError('Checkpoint challуnge endless loop, try to change ip', error.json)
                }
                return await checkpointErrorHandler(error)
            } else if (error.name === 'RequestError' && error.json.two_factor_required) {
                log.info('2FA auth required..')
                return await twoFactorErrorHandler(error)
            }
        }
    }

    async function checkpointErrorHandler(error) {
        try {
            log.info('Client web challenge resolving...')
            let type = ['phone', 'email']
            let typeNumeric = await readCodeFromConsole('Where to send the code?\n1 - phone (only if phone number connected to your account)\n2 - email')
            let challenge = await Client.Web.Challenge.resolveHtml(error, type[typeNumeric - 1])
            if (challenge.type !== null) {
                if (challenge.type != type[typeNumeric - 1]) {
                    log.warn(`Sorry, only ${challenge.type} verification method is available now`)
                }
                let code = await readCodeFromConsole(challenge.type + ' code:')
                log.debug(code)

                let challengeResponse = await challenge.code(code)
                log.debug(challengeResponse)

                if (challengeResponse === true) {
                    log.info('Сhallenge successfully passed!')
                    session = await createUserSession(username, password, false)
                }

                return session
            } else {
                log.error('Challenge type is null!')
                return new Exceptions.IncorrectChallengeTypeError('Challenge type is incorrect, it must be "phone" or "email"', challenge)
            }
        } catch (err) {
            log.error(err.name)
            if (err.name === 'NotPossibleToResolveChallenge') {
                log.error(err.message)
                return await checkpointErrorHandler(error)
            } else {
                return err
            }
        }
    }

    async function twoFactorErrorHandler(error) {
        try {
            let code = await readCodeFromConsole('2FA code:')
            log.info('2FA code sending...')

            let twoFactorResponse = await new Client.Request(session)
                                            .setMethod('POST')
                                            .setUrl(Client.CONSTANTS.API_ENDPOINT + 'accounts/two_factor_login/')
                                            .generateUUID()
                                            .signPayload()
                                            .setCSRFToken(session.CSRFToken)
                                            .setDevice(session.device)
                                            .setData({
                                                verification_method: 1,
                                                verification_code: code,
                                                two_factor_identifier: error.json.two_factor_info.two_factor_identifier,
                                                username: error.json.two_factor_info.username
                                            })
                                            .send()
            
            log.info('2FA challenge successfully passed!')

            if (twoFactorResponse.logged_in_user) {
                session = await createUserSession(username, password, false)
            }

            return session
        } catch (err) {
            log.error(err.name)
            if (err.name === 'RequestError' && err.json.error_type === 'sms_code_validation_code_invalid') {
                log.error(err.message)
                return await twoFactorErrorHandler(error)
            } else {
                return err
            }
        }
    }

    return {
        getSession: async function (_username, _password) {
            let userSession = await createUserSession(_username, _password)

            if(userSession instanceof Error) {
                throw userSession
            } else {
                return userSession
            }
        }
    }
}

module.exports.Logger = Logger