const express = require('express');
const router = express.Router();
const { sendMessage, getInterestMessages } = require('../controller/message');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/messages - Send a message to an interest (requires authentication)
router.post('/messages', authenticateToken, sendMessage);

// GET /api/messages/:interestId - Get all messages for an interest (requires authentication)
router.get('/messages/:interestId', authenticateToken, getInterestMessages);

module.exports = router;
