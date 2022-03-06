const Function = require('../function')

const auth = (req, res, next) => {
    const accessToken = req.cookies.access_token
    const refreshToken = req.cookies.refresh_token
    const oauthClient = Function.getOAuth()


    if (accessToken) {
        if (oauthClient.isAccessTokenValid()) {
            console.log("auth isTokenValid")
            next()
        } else {
            console.log("auth accessToken")
            oauthClient
                .refreshUsingToken(refreshToken)
                .then(function (authResponse) {
                    const response = JSON.parse(JSON.stringify(authResponse.getJson()))

                    res.cookie('access_token', response['access_token']);
                    res.cookie('refresh_token', response['refresh_token']);

                    next()
                })
                .catch(function (e) {
                    console.error('The error message is :' + e.originalMessage);
                    next(e)
                });
        }
    } else {
        console.log("auth else")
        next()
    }
}

module.exports = auth