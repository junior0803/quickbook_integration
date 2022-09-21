const QuickBooks = require('node-quickbooks')
const OAuthClient = require('intuit-oauth')

module.exports = {
    getQBO: function (accessToken, refreshToken) {
        return new QuickBooks(
            'ABkc9RfZ4dQ1pchfwW3yPZ7TXUbQ5Z6QgYpTjMuDFkHU5pllJO', // this is sandbox secret
            'PlYwbkcQSMB6ZY8sKYgDlXm1gHQAYN2zSAqr7Qfr', // this is the sandbox key
            accessToken,
            false, // no token secret for oAuth 2.0
            '4620816365239441190', 
            true, // use the sandbox? // set use sandbox // previous is false
            true, // enable debugging?
            null, // set minorversion, or null for the latest version
            '2.0', //oAuth version
            refreshToken)
    },
    getOAuth: function () {
        return new OAuthClient({
            clientId: 'ABkc9RfZ4dQ1pchfwW3yPZ7TXUbQ5Z6QgYpTjMuDFkHU5pllJO', //the same above
            clientSecret: 'PlYwbkcQSMB6ZY8sKYgDlXm1gHQAYN2zSAqr7Qfr', // the same above
            environment: 'sandbox', // thay doi sandbox, previous is production
            redirectUri: 'http://localhost:3000/callback/'
        })
    },
};