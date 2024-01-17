'use strict'
var _ = require('lodash')
var querystring = require('querystring')
var https = require('https')
var cookieParser = require('cookie-parser')
var helmet = require('helmet')
var passport = require('passport')
var session = require('express-session')
var SessionStore = require('connect-mongodb-session')(session)
var OAuth2Strategy = require('passport-oauth2').Strategy
var CustomStrategy = require('passport-custom').Strategy
const CognitoOAuth2Strategy = require('passport-cognito-oauth2')
var utils = require('../utils/writer.js')
var fs = require('fs')
var HttpsProxyAgent = require('https-proxy-agent')
var log = require('log')
const fetch = require('node-fetch')
const { enforceAuthentication, PROTECTED_URLS } = require('../service/auth.js')

var MongoClient = require('mongodb').MongoClient
var MongoUrl = process.env.MONGOURL || 'mongodb://meditor_database:27017/'
var DbName = 'meditor'
// todo: Figure out why there are multiple user collections; decouple EDL/URS & Cognito from authN users.
var USERS_COLLECTION_URS = 'users-urs'
var USERS_COLLECTION_MEDITOR = 'Users'

var APP_URL = (process.env.APP_URL || 'http://localhost') + '/meditor'

function fromSecretOrEnv(key) {
    var SECRETS_DIR = '/run/secrets/'

    if (fs.existsSync(SECRETS_DIR + key)) {
        return fs
            .readFileSync(SECRETS_DIR + key)
            .toString()
            .trim()
    } else {
        return process.env[key] || process.env[key.toUpperCase()]
    }
}

var AUTH_CONFIG = {
    HOST: fromSecretOrEnv('auth_host'),
    CLIENT_ID: fromSecretOrEnv('auth_client_id'),
    CLIENT_SECRET: fromSecretOrEnv('auth_client_secret'),
}

const COGNITO_OPTIONS = {
    callbackURL: APP_URL + '/api/login',
    clientDomain: fromSecretOrEnv('COGNITO_CLIENT_DOMAIN'),
    clientID: fromSecretOrEnv('COGNITO_CLIENT_ID'),
    clientSecret: fromSecretOrEnv('COGNITO_CLIENT_SECRET'),
    initiateAuthClientID: fromSecretOrEnv('COGNITO_INITIATE_AUTH_CLIENT_ID'),
    region: fromSecretOrEnv('COGNITO_REGION'),
    userIdentifier: fromSecretOrEnv('COGNITO_USER_IDENTIFIER')
        ? fromSecretOrEnv('COGNITO_USER_IDENTIFIER').toLowerCase()
        : 'username',
    get initiateAuthUrl() {
        return `https://cognito-idp.${this.region}.amazonaws.com/`
    },
}

var AUTH_PROTOCOL = 'https:'

// Earthdata's OAuth2 slightly deviates from what's supported in the current oauth module,
// so let's overwrite it
// Credit: most of code in this function belongs to https://github.com/ciaranj/node-oauth
require('oauth').OAuth2.prototype.getOAuthAccessToken = function (
    code,
    params,
    callback
) {
    var codeParam
    var postData
    var postHeaders
    var results
    var accessToken
    var refreshToken
    params = params || {}
    // Start of customization
    if (!('Authorization' in this._customHeaders)) {
        params.client_id = this._clientId
        params.client_secret = this._clientSecret
    }
    // End of customization
    codeParam = params.grant_type === 'refresh_token' ? 'refresh_token' : 'code'
    params[codeParam] = code
    postData = querystring.stringify(params)
    postHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    this._request(
        'POST',
        this._getAccessTokenUrl(),
        postHeaders,
        postData,
        null,
        function (error, data, response) {
            // eslint-disable-line no-unused-vars
            if (error) {
                callback(error)
            } else {
                try {
                    results = JSON.parse(data)
                } catch (e) {
                    results = querystring.parse(data)
                }
                accessToken = results.access_token
                refreshToken = results.refresh_token
                delete results.refresh_token
                callback(null, accessToken, refreshToken, results) // callback results =-=
            }
        }
    )
}

passport.serializeUser(function (userId, done) {
    done(null, userId)
})

passport.deserializeUser(function (userId, done) {
    var user = null
    MongoClient.connect(MongoUrl, function (err, db) {
        if (err) {
            console.log(err)
            throw err
        }
        var dbo = db.db(DbName)
        dbo.collection(USERS_COLLECTION_URS)
            .findOneAndUpdate(
                {
                    _id: userId,
                },
                {
                    $set: {
                        lastAccessed: _.now(),
                    },
                }
            )
            .then(function () {
                return dbo.collection(USERS_COLLECTION_URS).findOne({
                    uid: userId,
                })
            })
            .then(function (res) {
                user = res
                user.roles = []
                return dbo.collection(USERS_COLLECTION_MEDITOR).findOne(
                    {
                        id: userId,
                    },
                    { sort: { 'x-meditor.modifiedOn': -1 } }
                )
            })
            .then(function (res) {
                // Attach Meditor roles if available
                if (res) user.roles = res.roles
                done(null, user)
                db.close()
            })
            .catch(function (err) {
                console.log(err)
                done(err, null)
                db.close()
            })
    })
})

if (process.env.NODE_ENV === 'development') {
    passport.use(
        'impersonate',
        new CustomStrategy(async (req, done) => {
            let client = await MongoClient.connect(MongoUrl)
            let db = client.db(DbName)
            let uid = req.query.impersonate
            let user = null

            try {
                user = await db.collection(USERS_COLLECTION_URS).findOne({ uid })
            } catch (err) {
                return done(err)
            } finally {
                client.close()
                return user ? done(null, uid) : done()
            }
        })
    )
}

async function updateOrCreateUser(profile, uidField = 'uid') {
    const client = new MongoClient(MongoUrl)

    try {
        await client.connect()
        const db = client.db(DbName)

        const uid = profile[uidField]

        // TODO: support custom attributes for email, firstName, lastName
        let user = {
            uid,
            emailAddress:
                profile.emailAddress || profile.email_address || profile.email,
            firstName: profile.firstName || profile.first_name || uid,
            lastName: profile.lastName || profile.last_name || '',
            lastAccessed: _.now(),
        }

        const existingMeditorUser = await db
            .collection(USERS_COLLECTION_MEDITOR)
            .findOne({ id: uid })

        const existingUrsUser = await db
            .collection(USERS_COLLECTION_URS)
            .findOne({ uid })

        //* Upsert a user in the meditor users collection only if both collections don't have that user.
        if (_.isNil(existingUrsUser) && _.isNil(existingMeditorUser)) {
            // user does not exist, set the created date
            user.created = _.now()

            // a basic mEditor user to insert
            const mEditorUser = {
                id: uid,
                name: `${user.firstName} ${user.lastName}`,
                roles: getNewUserRoles(),
                'x-meditor': {
                    model: 'Users',
                    modifiedOn: new Date().toISOString(),
                    modifiedBy: 'system',
                    states: [
                        {
                            source: 'Init',
                            target: 'Draft',
                            modifiedOn: new Date().toISOString(),
                        },
                    ],
                },
            }

            // create or update the new user
            await db
                .collection(USERS_COLLECTION_MEDITOR)
                .findOneAndUpdate(
                    { id: uid },
                    { $set: mEditorUser },
                    { upsert: true }
                )
        }

        // create or update the user
        await db
            .collection(USERS_COLLECTION_URS)
            .findOneAndUpdate({ uid }, { $set: user }, { upsert: true })

        return user
    } catch (err) {
        log.error('Failed to update user in users-urs collection')
        log.error(err)
        throw err // rethrow
    } finally {
        client.close()
    }
}

/**
 * a new user is either created with no roles (mEditors default) or a set of roles as defined in the "NEW_USER_ROLES" ENV variable
 *
 * example: NEW_USER_ROLES=News.Author UMM-C.Author Alerts.Publisher
 *      would give a user roles of
 *      [{ model: "News", role: "Author" }, { model: "UMM-C", role: "Author" }, { model: "Alerts", role: "Publisher" }]
 */
function getNewUserRoles() {
    if (!process.env.NEW_USER_ROLES) {
        return [] // no defined new user roles, return an empty array
    }

    try {
        // ENV var in format NEW_USER_ROLES=News.Author News.Publisher UMM-C.Author
        return process.env.NEW_USER_ROLES.split(' ').map(modelAndRole => ({
            model: modelAndRole.split('.')[0].replace(/%20/g, ' '),
            role: modelAndRole.split('.')[1].replace(/%20/g, ' '),
        }))
    } catch (err) {
        // if we get here, the ENV variable was not setup correctly
        // this should be caught during development so we shouldn't need detailed error handling
        console.error(err)
        console.error(
            'Failed to parse new user roles, returning an empty set of roles'
        )
        return []
    }
}

async function verifyCognitoAuth(_accessToken, _refreshToken, profile, done) {
    log.debug('Cognito: authentication response ', profile)

    try {
        const user = await updateOrCreateUser(profile, COGNITO_OPTIONS.userIdentifier)

        log.debug('Cognito: updated user ', user)

        done(null, user.uid)
    } catch (err) {
        log.error('Cognito: failed to update user')
        log.error(err)
        done(err)
    }
}

if (COGNITO_OPTIONS.clientID) {
    passport.use(new CognitoOAuth2Strategy(COGNITO_OPTIONS, verifyCognitoAuth))
} else {
    let oauth2Strategy = new OAuth2Strategy(
        {
            authorizationURL:
                AUTH_PROTOCOL + '//' + AUTH_CONFIG.HOST + '/oauth/authorize',
            tokenURL: AUTH_PROTOCOL + '//' + AUTH_CONFIG.HOST + '/oauth/token',
            clientID: AUTH_CONFIG.CLIENT_ID,
            clientSecret: AUTH_CONFIG.CLIENT_SECRET,
            callbackURL: APP_URL + '/api/login',
            customHeaders: {
                Authorization: new Buffer(
                    AUTH_CONFIG.CLIENT_ID + ':' + AUTH_CONFIG.CLIENT_SECRET
                ).toString('base64'),
            },
        },
        function (accessToken, _refreshToken, authResp, profile, cb) {
            https
                .get(
                    {
                        protocol: AUTH_PROTOCOL,
                        hostname: AUTH_CONFIG.HOST,
                        path: authResp.endpoint,
                        headers: {
                            Authorization: 'Bearer ' + accessToken,
                        },
                    },
                    function (res) {
                        var resp = ''

                        res.on('data', function (data) {
                            resp += data
                        })

                        res.on('end', function () {
                            log.debug('URS: authentication response ', resp)

                            updateOrCreateUser(JSON.parse(resp))
                                .then(user => {
                                    log.debug('URS: updated user ', user)
                                    cb(null, user.uid)
                                })
                                .catch(err => {
                                    log.error('URS: failed to update user')
                                    log.error(err)
                                    cb(err)
                                })
                        })
                    }
                )
                .on('error', function (err) {
                    cb(err)
                })
        }
    )

    if (process.env.PROXY_REQUEST_URL) {
        let httpsProxyAgent = new HttpsProxyAgent(process.env.PROXY_REQUEST_URL)
        oauth2Strategy._oauth2.setAgent(httpsProxyAgent)
    }

    passport.use(oauth2Strategy)
}

function impersonateUser(req, res, next) {
    passport.authenticate('impersonate', function (impersonateReq, impersonateRes) {
        req.logIn(impersonateRes, function (err) {
            if (err) {
                utils.writeJson(
                    res,
                    {
                        code: 500,
                        message: err,
                    },
                    500
                )
            } else {
                res.writeHead(301, {
                    Location: APP_URL + '/login',
                })
                res.end()
            }
        })
    })(req, res, next)

    return
}

// Exported method to login
module.exports.login = function login(req, res, next) {
    if (process.env.NODE_ENV === 'development' && 'impersonate' in req.query) {
        return impersonateUser(req, res, next)
    }

    let authenticateErrorHandler = function (err, user) {
        if (err) {
            console.log('hit this error ', err)
            return next(err)
        }

        if (!user) {
            return res.send(401, {
                success: false,
                message: 'Authentication failed',
            })
        }

        req.logIn(user, function (err) {
            if (err) {
                console.log('hit a login error', err)
                return next(err)
            }

            res.writeHead(301, {
                Location: APP_URL + '/login',
            })

            res.end()
        })
    }

    if (process.env.COGNITO_CLIENT_ID) {
        passport.authenticate('cognito-oauth2', authenticateErrorHandler)(
            req,
            res,
            next
        )
    } else {
        passport.authenticate('oauth2', authenticateErrorHandler)(req, res, next)
    }
}

//* Not yet set up for URS/EDL login. POST to this EP could throw errors if Cognito is not configured in the environment.
module.exports.loginPost = async function loginPost(req, res, _next) {
    try {
        const response = await fetch(COGNITO_OPTIONS.initiateAuthUrl, {
            method: 'POST',
            body: JSON.stringify({
                AuthParameters: {
                    USERNAME: req.body.username,
                    PASSWORD: req.body.password,
                },
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: COGNITO_OPTIONS.initiateAuthClientID,
            }),
            redirect: 'follow',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
            },
        })

        if (!response.ok) {
            return utils.writeJson(res, await response.json(), 401)
        }

        const authResponse = await response.json()

        const idTokenPayload = JSON.parse(
            Buffer.from(
                authResponse.AuthenticationResult.IdToken.split('.')[1],
                'base64'
            ).toString('utf-8')
        )

        const { ['cognito:username']: username, email } = idTokenPayload

        const { uid, ...user } = await updateOrCreateUser(
            { email, username },
            COGNITO_OPTIONS.userIdentifier
        )

        req.session.passport = { user: uid }
        req.session.save(error => {
            if (error) {
                log.error(error)
            }
        })

        utils.writeJson(res, { uid, ...user }, 200)
    } catch (error) {
        log.error(error)
    } finally {
        res.end()
    }
}

// Exported method to logout
module.exports.logout = function logout(req, res, next) {
    var cookie = req.cookies
    var outCookies = []
    req.session.destroy()
    // Destroy all old cookies
    // for (var prop in cookie) {
    //   if (!cookie.hasOwnProperty(prop)) continue;
    //   outCookies.push(prop + '=;expires:' + (new Date(0)).toUTCString() + ';');
    // };
    // if (outCookies.length > 0) res.setHeader('Set-Cookie', outCookies);
    res.writeHead(301, {
        Location: APP_URL,
    })
    res.end()
}

// Exported method to get user info
module.exports.getMe = function getMe(req, res, next) {
    if (_.isEmpty(req.user)) {
        utils.writeJson(res, {}, 401)
    } else {
        utils.writeJson(res, req.user, 200)
    }
}

// Exported method to get user info
module.exports.getCsrfToken = function getCsrfToken(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Surrogate-Control', 'max-age=0')
    res.setHeader('Expires', '0')
    utils.writeJson(
        res,
        {
            csrfToken: req.csrfToken(),
        },
        200
    )
}

module.exports.init = function (app) {
    app.use(
        helmet({
            noCache: true,
        })
    )
    app.use(cookieParser())
    app.use(
        session({
            name: '__mEditor',
            secret: COGNITO_OPTIONS.clientSecret || AUTH_CONFIG.CLIENT_SECRET,
            resave: false,
            /* do not automatically write to the session store, even if the session was never modified during the request */
            saveUninitialized: true,
            /*   force a session that is "uninitialized" to be saved to the store
             *  a session is uninitialized when it is new but not modified
             *  https://www.npmjs.com/package/express-session
             */
            store: new SessionStore({
                uri: getMongoUrlWithDatabase(DbName),
                collection: 'Sessions',
            }),
        })
    )
    app.use(passport.initialize())
    app.use(passport.session())

    // Protect all PUT requests with cookie-based csrf
    // app.use('/meditor/api/', csrf({cookie: true}));

    if (process.env.STRICT_AUTHENTICATION) {
        app.use(enforceAuthentication(PROTECTED_URLS))
    }
}

function getMongoUrlWithDatabase(db) {
    let parts = MongoUrl.split('?')
    parts[0] = _.trimEnd(parts[0], '/') + '/' + DbName
    return parts.join('?')
}
