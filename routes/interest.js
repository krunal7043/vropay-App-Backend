const express = require('express');
const router = express.Router();
const interest = require('../controller/interest');
const { authenticateToken } = require('../middlewares/auth');

router.get('/interests', authenticateToken,interest.getAllInterests);
router.post('/interests', authenticateToken, interest.updateUserInterests);
router.post('/add-interest', interest.createInterest);

module.exports = router;