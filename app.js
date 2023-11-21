var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morganLog = require('morgan');
const cors = require('cors')
const app = express()
const {USER_COOKIE_SECRET} = require('./config')
const usersRouter = require('./routes/v1/users')

app.use(cors({
    methods: 'GET, POST'
}));
  
app.use(require('helmet')())
app.use(morganLog('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(USER_COOKIE_SECRET));

app.disable("etag");
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use('/v1/users', usersRouter);

module.exports = app;
