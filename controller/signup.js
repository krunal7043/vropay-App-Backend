const { OAuth2Client } = require("google-auth-library");
const User = require("../model/userSchema");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../services/emailService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth (Signin/Signup)
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: "ID token is required" });
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extract user info
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email not provided by Google" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // User exists - Sign in
      // Update to OAuth if not already
      if (user.loginType !== "oauth") {
        user.loginType = "oauth";
        user.googleId = googleId;
        user.name = name;
        user.isVerified = true;
        await user.save();
      }
    } else {
      // User doesn't exist - Sign up
      user = new User({
        email,
        name,
        loginType: "oauth",
        googleId,
        isVerified: true
      });
      await user.save();
      isNewUser = true;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: isNewUser ? "Signup successful" : "Login successful",
      token,
      isNewUser,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        loginType: user.loginType,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    if (error.message.includes("Wrong number of segments")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID token" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Email Signup Send otp
exports.signup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      await User.create({
        email,
        loginType: "email",
        otp,
        otpExpires,
        isVerified: false,
      });
    }

    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// verifyOTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        loginType: user.loginType,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


