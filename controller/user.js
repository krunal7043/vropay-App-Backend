const User = require('../model/userSchema');
const { sendEmailUpdateOTP } = require('../services/emailService');
const { sendOTP, sendPhoneUpdateOTP } = require('../services/smsService');


exports.addProfileDetails = async (req, res) => {
    try {
        const { firstName, lastName, gender, profession } = req.body;
        const userId = req.userId;

        if (!firstName || !lastName || !gender || !profession) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, gender, profession },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
                profession: user.profession
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { profession, interests, difficulty, community, notifications } = req.body;
        const userId = req.userId;

        const updateData = {};
        if (profession) updateData.profession = profession;
        if (interests) updateData.interests = interests;
        if (difficulty) updateData.difficulty = difficulty;
        if (community) updateData.community = community;
        if (notifications) updateData.notifications = notifications;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).populate('interests');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            user: {
                id: user._id,
                profession: user.profession,
                interests: user.interests,
                difficulty: user.difficulty,
                community: user.community,
                notifications: user.notifications
            }
        });

    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.setDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.body;
        const userId = req.userId;

        if (!difficulty) {
            return res.status(400).json({ success: false, message: 'Difficulty level is required' });
        }

        if (!['Beginner', 'Intermediate', 'Advance'].includes(difficulty)) {
            return res.status(400).json({ success: false, message: 'Invalid difficulty level' });
        }

        const existingUser = await User.findById(userId);
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please complete signup first.'
            });
        }

        const isFirstTime = !existingUser.difficulty;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { difficulty },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: isFirstTime ? 'Difficulty level set successfully' : 'Difficulty level updated successfully',
            difficulty: user.difficulty
        });

    } catch (error) {
        console.error('Difficulty update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.setCommunity = async (req, res) => {
    try {
        const { community } = req.body;
        const userId = req.userId;

        if (!community) {
            return res.status(400).json({ success: false, message: 'Community preference is required' });
        }

        if (!['In', 'Out'].includes(community)) {
            return res.status(400).json({ success: false, message: 'Invalid community preference' });
        }

        const existingUser = await User.findById(userId);
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please complete signup first.'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { community },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Community preference set successfully',
            community: user.community
        });

    } catch (error) {
        console.error('Community update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.setNotification = async (req, res) => {
    try {
        const { notifications } = req.body;
        const userId = req.userId;

        if (!notifications) {
            return res.status(400).json({ success: false, message: 'Notification preference is required' });
        }

        if (!['Allowed', 'Not allowed'].includes(notifications)) {
            return res.status(400).json({ success: false, message: 'Invalid notification preference' });
        }

        const existingUser = await User.findById(userId);
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please complete signup first.'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { notifications },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Notification preference set successfully',
            notifications: user.notifications
        });

    } catch (error) {
        console.error('Notifications update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).populate('interests');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
                profession: user.profession,
                interests: user.interests,
                difficulty: user.difficulty,
                community: user.community,
                notifications: user.notifications
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateGeneralDetails = async (req, res) => {
    try {
        const { firstName, lastName, gender } = req.body;
        const userId = req.userId;
        
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (gender) updateData.gender = gender;
        if (req.file) updateData.profileImage = req.file.filename;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'General details updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('General details update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.profileEmailUpdate = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.userId;

        if (!newEmail) {
            return res.status(400).json({ success: false, message: 'New email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const otpCode = Math.floor(10000 + Math.random() * 90000);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.findByIdAndUpdate(userId, {
            newEmail,
            otp: otpCode,
            otpExpires
        });

        await sendEmailUpdateOTP(newEmail, otpCode);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to new email'
        });

    } catch (error) {
        console.error('Email update request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.verifyUpdateEmail = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.userId;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp || !user.newEmail) {
            return res.status(400).json({ success: false, message: 'No email update request found' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        await User.findByIdAndUpdate(userId, {
            email: user.newEmail,
            $unset: {
                newEmail: 1,
                otp: 1,
                otpExpires: 1
            }
        });

        res.status(200).json({
            success: true,
            message: 'Email updated successfully'
        });

    } catch (error) {
        console.error('Email update verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.phoneVerification = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const userId = req.userId;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format' });
        }

        const otp = Math.floor(10000 + Math.random() * 90000);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.findByIdAndUpdate(userId, {
            phoneNumber,
            otp,
            otpExpires
        });

        await sendOTP(phoneNumber, otp);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to phone number'
        });

    } catch (error) {
        console.error('Phone verification request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.verifyPhoneNumber = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.userId;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp || !user.phoneNumber) {
            return res.status(400).json({ success: false, message: 'No phone verification request found' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        await User.findByIdAndUpdate(userId, {
            phoneNumberVerified: true,
            $unset: {
                otp: 1,
                otpExpires: 1
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phone number verified successfully'
        });

    } catch (error) {
        console.error('Phone verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.requestPhoneUpdate = async (req, res) => {
    try {
        const { newPhoneNumber } = req.body;
        const userId = req.userId;

        if (!newPhoneNumber) {
            return res.status(400).json({ success: false, message: 'New phone number is required' });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(newPhoneNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format' });
        }

        const otp = Math.floor(10000 + Math.random() * 90000);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.findByIdAndUpdate(userId, {
            newPhoneNumber,
            otp,
            otpExpires
        });

        await sendPhoneUpdateOTP(newPhoneNumber, otp);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to new phone number'
        });

    } catch (error) {
        console.error('Phone update request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.verifyPhoneUpdate = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.userId;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp || !user.newPhoneNumber) {
            return res.status(400).json({ success: false, message: 'No phone update request found' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        await User.findByIdAndUpdate(userId, {
            phoneNumber: user.newPhoneNumber,
            phoneNumberVerified: true,
            $unset: {
                newPhoneNumber: 1,
                otp: 1,
                otpExpires: 1
            }
        });

        res.status(200).json({
            success: true,
            message: 'Phone number updated successfully'
        });

    } catch (error) {
        console.error('Phone update verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};