const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');
const { sendOTP, sendPhoneUpdateOTP } = require('../services/smsService');

exports.signin = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format' });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register yourself first' });
        }

        const otp = Math.floor(10000 + Math.random() * 90000);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires
        });

        await sendOTP(phoneNumber, otp);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your phone number'
        });

    } catch (error) {
        console.error('Signin request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.verifySignin = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp) {
            return res.status(400).json({ success: false, message: 'No signin request found' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await User.findByIdAndUpdate(user._id, {
            $unset: {
                otp: 1,
                otpExpires: 1
            }
        });

        res.status(200).json({
            success: true,
            message: 'Signin successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });

    } catch (error) {
        console.error('Signin verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};