const express = require('express');
const router = express.Router();
const { sendMessage, getInterestMessages, getInterestUserCount } = require('../controller/message');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/messages - Send a message to an interest (requires authentication)
router.post('/messages', authenticateToken, sendMessage);

// GET /api/messages/:interestId - Get all messages for an interest (requires authentication)
router.get('/messages/:interestId', authenticateToken, getInterestMessages);

// GET /api/messages/interest/:interestId/user-count - Get user count for an interest (requires authentication)
router.get('/user-count/:interestId', authenticateToken, getInterestUserCount);

module.exports = router;
