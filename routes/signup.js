const express = require("express");
const router = express.Router();
const signup = require("../controller/signup");

// Route for Google OAuth authentication
router.post("/google-auth", signup.googleAuth);

// Route for email signup
router.post("/signup", signup.signup);

// Route for OTP verification
router.post("/verify-otp", signup.verifyOTP);

module.exports = router;
