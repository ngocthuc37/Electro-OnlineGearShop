// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/user');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Email chưa được đăng ký' });
                    }

                    // Match password and activated
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            // if (user.activated == false) { // Not activated
                            //     return done(null, false, { message: 'Tài khoản chưa được kích hoạt, vui lòng kiểm tra email và kích hoạt tài khoản' });
                            // } else 
                            if (user.locked == true) { // Locked by admin
                                return done(null, false, { message: 'Tài khoản tạm thời đã bị khóa bởi quản trị viên' });
                            } else {
                                return done(null, user);
                            }
                        } else {
                            return done(null, false, { message: 'Mật khẩu không đúng' });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}