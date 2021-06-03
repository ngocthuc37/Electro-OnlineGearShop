const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
var User = require('../models/user');

// Login Page
exports.loginPage = (req, res) => {
    res.render('pages/login');
}

// Login Handle
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
}

// Logout Handle
exports.logoutHandle = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Bạn đã đăng xuất');
    res.redirect('/login');
}