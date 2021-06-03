const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer');

// Configure nodemailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shopphukien.tttteam@gmail.com',
        pass: 'hcmus18120595'
    }
});

var mailOptions = {
    from: 'shopphukien.tttteam@gmail.com'
};

// Models
var User = require('../models/user');

// Register Page
exports.registerPage = (req, res) => {
    res.render('pages/account/register');
}

// Activate Account Page
exports.activatePage = (req, res) => {
    // Find user by ID
    User.findOne({ _id: req.params.id })
        .then(user => {
            user.activated = true;
            user.save();
            res.render('pages/account/activate');
        })
        .catch(err => console.log(err));
}

// Login Page
exports.loginPage = (req, res) => {
    res.render('pages/account/login');
}

// Profile Page
exports.profile = (req, res) => {
    res.render('pages/account/profile', { user: req.user });
}

// Register Handle
exports.registerHandle = (req, res) => {
    const { name, email, password } = req.body;
    let errors = [];

    if (errors.length > 0) {
        res.render('pages/account/register', {
            errors
        });
    } else {
        // Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User exists
                    errors.push({ msg: 'Email đã được đăng ký. Vui lòng nhập email khác.' });
                    res.render('pages/account/register', { errors });
                } else {
                    const newUser = new User({ name, email, password });

                    // Hash password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hashed
                            newUser.password = hash;
                            // Save user
                            newUser.save()
                                .then(user => {
                                    // Configure mailOptions
                                    mailOptions.to = email;
                                    mailOptions.subject = 'Kích hoạt tài khoản';
                                    mailOptions.text = 'Truy cập đường dẫn sau để kích hoạt tài khoản ' +
                                        req.protocol + '://' + req.get('host') + '/users/activate/' + user._id;

                                    // Send email
                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });

                                    req.flash('success_msg', 'Bạn đã đăng ký thành công, vui lòng kiểm tra email và kích hoạt tài khoản');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        }));
                }
            });
    }
}

// Login Handle
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
}

// Update Profile
exports.updateProfile = (req, res) => {
    let errors = [];
    const newName = req.body.name;
    const newPhone = req.body.phone;
    const newAddress = req.body.address;

    User.findOne({ _id: req.user._id }) // Find user by ID
        .then(user => {
            if (newName != '') {
                user.name = newName;
            }
            if (newPhone != '') {
                user.phone = newPhone;
            }
            if (newAddress != '') {
                user.address = newAddress;
            }
            user.save()
                .then(user => {
                    req.flash('success_msg', 'Bạn đã cập nhật thành công');
                    res.redirect('/users/profile');
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}

// Checkout Page
exports.checkoutPage = (req, res) => {
    res.render('pages/order/checkout', { user: req.user });
}

// Logout Handle
exports.logoutHandle = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Bạn đã đăng xuất');
    res.redirect('/users/login');
}

// Change Password Page
exports.changePasswordPage = (req, res) => {
    res.render('pages/account/change-password', { user: req.user });
}

// Change Password Handle
exports.changePasswordHandle = (req, res) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    User.findOne({ _id: req.user._id }) // Find user by ID
        .then(user => {
            // Recheck old password
            bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) { // Match
                    // Hash new password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            user.password = hash;
                            // Save new password
                            user.save()
                                .then(user => {
                                    req.flash('success_msg', 'Bạn đã đổi mật khẩu thành công');
                                    res.redirect('/users/change-password');
                                })
                                .catch(err => console.log(err));
                        }));
                } else { // Not match
                    req.flash('error_msg', 'Mật khẩu cũ không đúng');
                    res.redirect('/users/change-password');
                }
            });
        })
        .catch(err => console.log(err));
}

// Forget Password Page
exports.forgetPasswordPage = (req, res) => {
    res.render('pages/account/forget-password');
}

// Forget Password Handle
exports.forgetPasswordHandle = (req, res) => {
    // Get email
    var email = req.body.email;

    // Find user by email
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'Email chưa được đăng ký');
                res.redirect('/users/forget-password');
            } else {
                // Configure mailOptions
                mailOptions.to = email;
                mailOptions.subject = 'Đặt lại mật khẩu';
                mailOptions.text = 'Mã xác nhận của bạn: ' + user._id +
                    '. Truy cập đường dẫn sau để đặt lại mật khẩu: ' +
                    req.protocol + '://' + req.get('host') + '/users/reset-password?email=' + user.email;

                // Send email
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                res.redirect('/users/reset-password?email=' + user.email);
            }
        })
        .catch(err => console.log(err));
}

// Reset Password Page
exports.resetPasswordPage = (req, res) => {
    res.render('pages/account/reset-password', { email: req.query.email });
}

// Reset Password Handle
exports.resetPasswordHandle = (req, res) => {
    const email = req.query.email;
    const verifyCode = req.body.verifyCode;
    const newPassword = req.body.newPassword;

    // Find user by email
    User.findOne({ email: email })
        .then(user => {
            if (user._id != verifyCode) {
                req.flash('error_msg', 'Mã xác nhận không đúng');
                res.redirect('/users/reset-password?email=' + email);
            } else {
                // Hash new password
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newPassword, salt, (err, hash) => {
                        user.password = hash;
                        // Save new password
                        user.save()
                            .then(user => {
                                req.flash('success_msg', 'Bạn đã đặt lại mật khẩu thành công');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    }));
            }
        })
        .catch(err => console.log(err));
}