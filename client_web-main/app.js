// set up
var express = require('express');
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');

var expressLayouts = require('express-ejs-layouts');

const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
var createError = require('http-errors');
const ejsLint = require('ejs-lint');
var Database = require('./db/database');

// router files
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Layout
app.use(expressLayouts);
app.set('layout', 'layout');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static path
app.use(express.static(path.join(__dirname, 'public')));
app.use('/category', express.static(path.join(__dirname, 'public')));
app.use('/producer', express.static(path.join(__dirname, 'public')));
app.use('/product', express.static(path.join(__dirname, 'public')));
app.use('/search', express.static(path.join(__dirname, 'public')));
app.use('/users', express.static(path.join(__dirname, 'public')));
app.use('/users/activate', express.static(path.join(__dirname, 'public')));
app.use('/users/track-order', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Router
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Passport config
require('./config/passport')(passport);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
