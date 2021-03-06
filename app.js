const BodyParser = require('body-parser');
const Bunyan = require('bunyan');
const CookieParser = require('cookie-parser');
const Express = require('express');
const Keycloak = require('keycloak-connect');
const FS = require('fs');
const Logger = require('morgan');
const mongoose = require('mongoose');
const Path = require('path');
const Redis = require("redis");
const RequestUtil = require('./util/request_util');
const ResponseWrapper = require('./util/response_wrapper');
const KeycloakUtil = require('./util/keycloak_util');

const session = require('express-session');
const Constant = require('./util/constants.js');
const Vasync = require('vasync');
const URL = require('url');

const log = Bunyan.createLogger({ name: "polamikat:app" });

var mode = process.env.MODE ? process.env.MODE : "local";

process.env.TZ = 'Asia/Jakarta';

console.log(JSON.stringify(process.env));

//read properties.json
PROPERTIES = JSON.parse(FS.readFileSync('./resources/properties.json', 'utf8'))[mode];
log.info("PROPERTIES", PROPERTIES);

mongoose.connect(PROPERTIES.mongodb); //connect to mongodb
mongoose.Promise = global.Promise;

REDIS_CLIENT = Redis.createClient(PROPERTIES.redis.url); //connecto to redis server


BASE_DIR = __dirname;

var app = Express();

// view engine setup
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(Logger('dev'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(CookieParser());
app.use(Express.static(Path.join(__dirname, 'public')));
app.use('/public', Express.static(Path.join(__dirname, PROPERTIES.resourcePaths.public)));

var RedisStore = require('connect-redis')(session);

app.use(session({
    secret: 'Jk6Da1faDSoWDw4',
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({
        client: REDIS_CLIENT
    })
}));


app.use(ResponseWrapper);

/* Keycloak */
var keycloak = KeycloakUtil.init({
    store: RedisStore
}, PROPERTIES.keycloak.config);

app.use(keycloak.middleware());

// include routes here
var index = require('./routes/index');
var admin = require('./routes/admin');
var user = require('./routes/user');
var activity = require('./routes/activity');
var files = require('./routes/files');
var attendance = require('./routes/attendance');

// routes
app.get('/browser/close/:openApp?', function (req, res) {
    res.render('browser_action', {
        openApp: req.params.openApp || '',
    });
});
app.get('/browser/require-login/:openApp?', function (req, res) {
    res.render('browser_action', {
        openApp: req.params.openApp || '',
    });
});

app.use('/', KeycloakUtil.protect(), RequestUtil.authenticate, index);

app.use('/admin', KeycloakUtil.protectSystemAdmin(), RequestUtil.authenticate, admin);
app.use('/user', KeycloakUtil.protect(), RequestUtil.authenticate, user);
app.use('/activity', KeycloakUtil.protect(), RequestUtil.authenticate, activity);
app.use('/files', KeycloakUtil.protect(), RequestUtil.authenticate, files);
app.use('/attendance', attendance);

// web
// app.use('/me', keycloak.protect(), RequestUtil.authenticate, Me);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {

        if ( err == Constant.ERROR_FILE_TYPE || err == Constant.ERROR_IMG_DIMENSION ) {
            res.fail(err);
        } else if (err.code === 'LIMIT_FILE_SIZE') {
            res.fail(Constant.ERROR_FILE_SIZE)
        } else {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }
        
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {

    if ( err == Constant.ERROR_FILE_TYPE || err == Constant.ERROR_IMG_DIMENSION ) {
        res.fail(err);
    } else if (err.code === 'LIMIT_FILE_SIZE') {
        res.fail(Constant.ERROR_FILE_SIZE)
    } else {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    }

});

module.exports = app;