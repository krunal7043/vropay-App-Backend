const express = require('express');
const router = express.Router();
const { sendMessage, sendImportantMessage, shareEntry, getInterestMessages, getInterestUserCount } = require('../controller/message');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/messages - Send a message to an interest (requires authentication)
router.post('/messages', authenticateToken, sendMessage);

// POST /api/messages/important - Send an important message to an interest (requires authentication)
router.post('/messages/important', authenticateToken, sendImportantMessage);

// POST /api/messages/share-entry - Share an entry as a message (requires authentication)
router.post('/messages/share-entry', authenticateToken, shareEntry);

// GET /api/messages/:interestId - Get all messages for an interest (requires authentication)
router.get('/messages/:interestId', authenticateToken, getInterestMessages);

// GET /api/messages/interest/:interestId/user-count - Get user count for an interest (requires authentication)
router.get('/user-count/:interestId', authenticateToken, getInterestUserCount);

module.exports = router;
