const express = require("express");
const router = express.Router();
const signup = require("../controller/signup");
const { authenticateToken } = require('../middlewares/auth');

// Route for Google OAuth authentication
router.post("/google-auth", signup.googleAuth);

// Route for email signup
router.post("/signup", signup.signup);

// Route for OTP verification
router.post("/verify-otp", signup.verifyOTP);

// signup phone verification
router.post('/request-phone-verification', authenticateToken, signup.signUpPhoneVerification);
router.post('/verify-phone-number', authenticateToken, signup.SignupVerifyPhoneNumber);

module.exports = router;
