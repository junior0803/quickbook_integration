const QuickBooks = require('node-quickbooks')
const OAuthClient = require('intuit-oauth')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const router = require('./routes/routes')
const authMiddleware = require('./middleware/auth')

const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', './views')
app.set('routes', './routes')
app.set('Access-Control-Allow-Origin', '*')
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({
    origin: '*'
}))
app.use(cookieParser())
app.use(express.static(__dirname + '/public'))
app.use(authMiddleware)

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})

app.use('/', router)

app.listen(port, () => {
    console.log('App listening on port 3000')
})