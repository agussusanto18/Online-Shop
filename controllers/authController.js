const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');

// Render the Signin Page
exports.signin = async (req, res) => {
    res.render('auth/signin', {
        success_msg: req.flash('success_msg')[0] || null,
        error_msg: req.flash('error_msg')[0] || null
    });
};

// Render the Signup Page
exports.signup = async (req, res) => {
    res.render('auth/signup', {
        success_msg: req.flash('success_msg')[0] || null,
        error_msg: req.flash('error_msg')[0] || null,
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
};

// Handle User Signout
exports.signout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to log out.');
        }
        res.redirect('/auth/signin');
    });
};

// Process Signin
exports.signinProcess = async (req, res) => {
    const { email, password, remember } = req.body;

    if (!email || !password) {
        return res.render('auth/signin', {
            error_msg: 'Please enter both email and password.',
            success_msg: ''
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/signin', {
                error_msg: 'No user found with this email.',
                success_msg: ''
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/signin', {
                error_msg: 'Incorrect password.',
                success_msg: ''
            });
        }

        req.session.user = { id: user._id, email: user.email };

        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        // if (remember === 'yes') {
        //     req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        // } else {
        //     req.session.cookie.maxAge = null;
        // }

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/auth/signin');
    }
};

// Process Signup
exports.signupProcess = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    let error_msg = "";

    if (!username || !email || !password || !confirmPassword) {
        error_msg = 'Please fill in all fields';
    } else if (password !== confirmPassword) {
        error_msg = 'Passwords do not match';
    } else if (password.length < 6) {
        error_msg = 'Password must be at least 6 characters';
    }

    if (error_msg) {
        return res.render('auth/signup', {
            error_msg,
            success_msg: '',
            username,
            email,
            password,
            confirmPassword
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/signup', {
                error_msg: 'Email is already registered',
                success_msg: '',
                username,
                email,
                password,
                confirmPassword
            });
        }

        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL, 
        //         pass: process.env.PASS,
        //     }
        // });
    
        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: 'Welcome to Our Service',
        //     text: `Hello ${name},\n\nThank you for signing up!`,
        // };

        // await transporter.sendMail(mailOptions);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/signin');
    } catch (err) {
        console.error(err);
        res.render('auth/signup', {
            error_msg: 'Something went wrong',
            success_msg: '',
            username,
            email,
            password,
            confirmPassword
        });
    }
};

// Render Forgot Password Page
exports.forgotPassword = async (req, res) => {
    res.render('auth/reset_password', {
        success_msg: req.flash('success_msg')[0] || null,
        error_msg: req.flash('error_msg')[0] || null
    });
};

// Handle Send Reset Token
exports.sendResetToken = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.render('auth/reset_password', {
            success_msg: '',
            error_msg: 'Please fill in all fields'
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'No account with that email found.');
            return res.redirect('/auth/reset');
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset your password.\n\n
                   Please click on the following link, or paste it into your browser to complete the process:\n\n
                   http://${req.headers.host}/auth/reset/${token}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        req.flash('success_msg', `An email has been sent to ${user.email} with further instructions.`);
        res.redirect('/auth/reset');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred.');
        res.redirect('/auth/reset');
    }
};

// Render Reset Password Form
exports.resetPasswordForm = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/reset');
        }

        res.render('auth/reset_password_form', {
            token,
            error_msg: req.flash('error_msg')[0] || null,
            success_msg: req.flash('success_msg')[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
};

// Handle Password Reset
exports.resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    let error_msg = '';

    if (!password || !confirmPassword) {
        error_msg = 'Please enter both password and confirm password.';
    } else if (password !== confirmPassword) {
        error_msg = 'Passwords do not match';
    }

    if (error_msg) {
        req.flash('error_msg', error_msg);
        return res.redirect(`/auth/reset/${token}`);
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/reset');
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Your password has been updated.');
        res.redirect('/auth/signin');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
};
