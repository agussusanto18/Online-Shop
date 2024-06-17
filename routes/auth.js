var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../utils/auth')

router.get('/signin', auth.isNotAuthenticated, authController.signin);
router.get('/signup', auth.isNotAuthenticated, authController.signup);
router.post('/signin', auth.isNotAuthenticated, authController.signinProcess);
router.post('/signup', auth.isNotAuthenticated, authController.signupProcess);
router.get('/signout', auth.isAuthenticated, authController.signout);
router.get('/reset', auth.isNotAuthenticated, authController.forgotPassword);
router.post('/reset', auth.isNotAuthenticated, authController.sendResetToken);
router.get('/reset-form/:token', auth.isNotAuthenticated, authController.resetPasswordForm);
router.post('/reset-form/:token', auth.isNotAuthenticated, authController.resetPassword);

module.exports = router;
