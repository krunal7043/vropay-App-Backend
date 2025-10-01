const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const user = require('../controller/user');
const { authenticateToken } = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage });

// Profile
router.put('/profile', authenticateToken, user.addProfileDetails);
router.get('/profile', authenticateToken, user.getUserProfile);
router.put('/updateProfileDetails', authenticateToken, upload.single('profileImage'), user.updateGeneralDetails);

// preferences and set level
router.put('/preferences', authenticateToken, user.updatePreferences);
router.post('/set-difficulty', authenticateToken, user.setDifficulty);
router.post('/set-community', authenticateToken, user.setCommunity);
router.post('/set-notifications', authenticateToken, user.setNotification);

// Update email verification
router.post('/request-email-update', authenticateToken, user.profileEmailUpdate);
router.post('/verify-email-update', authenticateToken, user.verifyUpdateEmail);



// update phone verification
router.post('/request-phone-update', authenticateToken, user.ProfilePhoneUpdate);
router.post('/verify-phone-update', authenticateToken, user.verifyPhoneUpdate);




//logout
router.post('/logout', authenticateToken, user.logout);

//deactivate account
router.delete('/deactivate', authenticateToken, user.deactivateAccount);

module.exports = router;