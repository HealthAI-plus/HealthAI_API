var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morganLog = require('morgan');
const cors = require('cors')
const app = express()
const {COOKIE_PARSER_SECRET} = require('./config')
const usersRouterV1 = require('./routes/v1/users')
const {verifyEmail, decodeSharableThreadLink} = require('./routes/v1/middlewares/users')
const threadsRouterV1 = require('./routes/v1/threads');
const messagesRouterV1 = require('./routes/v1/messages');
const translationsRouterV1 = require('./routes/v1/translations');
const cardsRouterV1 = require('./routes/v1/cards');
const subscriptionsRouterV1 = require('./routes/v1/subscriptions');
const {rateLimit} = require('express-rate-limit')

app.use(cors({
    methods: 'GET, POST, DELETE',
    origin: [
        'https://health-ai-alpha.vercel.app',
        'http://localhost:5173'
    ],
    credentials: true
}));
const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 150,
    legacyHeaders: false,
    standardHeaders: 'draft-7'
})

app.set('trust proxy', 'loopback')
app.use(rateLimiter)
app.use(require('helmet')())
app.use(morganLog('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_PARSER_SECRET));

app.disable("etag");
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use('/api/v1/users/', usersRouterV1);
app.use('/api/v1/threads/', threadsRouterV1);
app.use('/api/v1/messages/', messagesRouterV1);
app.use('/api/v1/translations/', translationsRouterV1);
app.use('/api/v1/cards/', cardsRouterV1);
app.use('/api/v1/subscriptions/', subscriptionsRouterV1);

app.get('/cardsetup', (req, res) => {
    res.render('stripeElement')
})

app.use('/verifyemail/:slug', verifyEmail);

app.get('/invite/:slug', (req, res, next) => {
    switch (req.query.ty) {
        case 'thread':
            decodeSharableThreadLink(req, res)
            return
        default:
            next()
    }
}, (req, res, next)=> res.send('Invalid invite link'));


module.exports = app