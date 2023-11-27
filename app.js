var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morganLog = require('morgan');
const cors = require('cors')
const app = express()
const {COOKIE_PARSER_SECRET, LOCAL_REACT_DEV_URL, PRODUCTION_REACT_DEV_URL} = require('./config')
const usersRouterV1 = require('./routes/v1/users')
const {verifyEmail} = require('./routes/v1/middlewares/users')
const threadsRouterV1 = require('./routes/v1/threads');
const messagesRouterV1 = require('./routes/v1/messages');
const translationsRouterV1 = require('./routes/v1/translations');

app.use(cors({
    methods: 'GET, POST',
    origin: [
        LOCAL_REACT_DEV_URL, 
        PRODUCTION_REACT_DEV_URL
    ],
    credentials: true
}));
  
app.use(require('helmet')())
app.use(morganLog('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_PARSER_SECRET));

app.disable("etag");
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use('/api/v1/users/', usersRouterV1);
app.use('/api/v1/threads/', threadsRouterV1);
app.use('/api/v1/messages/', messagesRouterV1);
app.use('/api/v1/translations/', translationsRouterV1);
app.use('/verifyemail/:slug', verifyEmail)


module.exports = app