const QuickBooks = require('node-quickbooks')
const OAuthClient = require('intuit-oauth')

module.exports = {
    getQBO: function (accessToken, refreshToken) {
        return new QuickBooks(
            process.env.QUICKBOOKS_CLIENT_ID,
            process.env.QUICKBOOKS_SECRET_KEY,
            accessToken,
            false, // no token secret for oAuth 2.0
            process.env.QUICKBOOKS_REALM_ID,
            true, // use the sandbox?
            false, // enable debugging?
            null, // set minorversion, or null for the latest version
            '2.0', //oAuth version
            refreshToken)
    },
    getOAuth: function () {
        return new OAuthClient({
            clientId: process.env.QUICKBOOKS_CLIENT_ID,
            clientSecret: process.env.QUICKBOOKS_SECRET_KEY,
            environment: 'sandbox',
            redirectUri: 'http://localhost:3000/callback/'
        })
    },
};