const Message = require('../model/Message');
const Interest = require('../model/Interest');
const User = require('../model/userSchema');

// POST /api/messages - Send a message to an interest group
const sendMessage = async (req, res) => {
    try {
        const { interestId, message } = req.body;
        const userId = req.user?._id;// Get userId from token

        // console.log(userId);

        // Validate required fields
        if (!interestId || !message) {
            return res.status(400).json({
                success: false,
                message: 'interestId and message are required'
            });
        }

        // Validate userId from token
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Check if the interest exists
        const interest = await Interest.findById(interestId);
        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the user is a member of the interest
        // Since userid is an array in Interest schema, check if userId is in the array
        const isMember = interest.userId.some(id => id.toString() === userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'User is not a member of this interest'
            });
        }

        // Create and save the message with isImportant explicitly set to false
        const newMessage = new Message({
            interestId,
            userId,
            message,
            isImportant: false  // Explicitly set to false for normal messages
        });

        const savedMessage = await newMessage.save();

        // Populate the message with user details for response
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('userId', 'firstName lastName')
            .populate('interestId', 'name');

        // For POST (send message), don't transform the name - just return basic user info
        const responseMessage = {
            ...populatedMessage.toObject(),
            userId: {
                _id: populatedMessage.userId._id,
                firstName: populatedMessage.userId.firstName,
                lastName: populatedMessage.userId.lastName
            }
        };

        // Emit the message to all clients in the interest group via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(interestId).emit('newMessage', {
                success: true,
                message: responseMessage
            });
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: responseMessage
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// GET /api/messages/:interestId - Get all messages for an interest
const getInterestMessages = async (req, res) => {
    try {
        const { interestId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Check if the interest exists
        const interest = await Interest.findById(interestId);
        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        // Get messages with pagination (newest first)
        const messages = await Message.find({ interestId })
            .populate('userId', 'firstName lastName')
            .populate('interestId', 'name')
            .populate('sharedEntry.mainCategoryId', 'name')  // Also populate main category name if entry is shared
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Transform messages to combine firstName and lastName
        const transformedMessages = messages.map(message => {
            const firstName = message.userId.firstName || '';
            const lastName = message.userId.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
            
            return {
                ...message.toObject(),
                userId: {
                    _id: message.userId._id,
                    name: fullName
                }
            };
        });

        const totalMessages = await Message.countDocuments({ interestId });

        res.status(200).json({
            success: true,
            data: {
                messages: transformedMessages, // Show newest messages first with combined names
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalMessages / limit),
                    totalMessages,
                    hasNext: page < Math.ceil(totalMessages / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// GET /api/messages/interest/:interestId/user-count - Get user count for an interest
// POST /api/messages/important - Send an important message to an interest group
const sendImportantMessage = async (req, res) => {
    try {
        const { interestId, message } = req.body;
        const userId = req.user?._id; // Get userId from token

        // Validate required fields
        if (!interestId || !message) {
            return res.status(400).json({
                success: false,
                message: 'interestId and message are required'
            });
        }

        // Validate userId from token
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Check if the interest exists
        const interest = await Interest.findById(interestId);
        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the user is a member of the interest
        const isMember = interest.userId.some(id => id.toString() === userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'User is not a member of this interest'
            });
        }

        // Create and save the important message
        const newMessage = new Message({
            interestId,
            userId,
            message,
            isImportant: true  // Always set to true for important messages
        });

        const savedMessage = await newMessage.save();

        // Populate the message with user details for response
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('userId', 'firstName lastName')
            .populate('interestId', 'name');

        const responseMessage = {
            ...populatedMessage.toObject(),
            userId: {
                _id: populatedMessage.userId._id,
                firstName: populatedMessage.userId.firstName,
                lastName: populatedMessage.userId.lastName
            }
        };

        // Emit the important message to all clients in the interest group via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(interestId).emit('newImportantMessage', {
                success: true,
                message: responseMessage
            });
        }

        res.status(201).json({
            success: true,
            message: 'Important message sent successfully',
            data: responseMessage
        });

    } catch (error) {
        console.error('Error sending important message:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// POST /api/messages/share-entry - Share an entry as a message
const shareEntry = async (req, res) => {
    try {
        const { interestId, message, mainCategoryId, subCategoryId, topicId, entryId } = req.body;
        const userId = req.user?._id; // Get userId from token

        // Validate required fields
        if (!interestId || !message || !mainCategoryId || !subCategoryId || !topicId || !entryId) {
            return res.status(400).json({
                success: false,
                message: 'interestId, message, mainCategoryId, subCategoryId, topicId, and entryId are required'
            });
        }

        // Validate userId from token
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Check if the interest exists
        const interest = await Interest.findById(interestId);
        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the user is a member of the interest
        const isMember = interest.userId.some(id => id.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'User is not a member of this interest'
            });
        }

        // Get the entry details from learnScreen
        const MainCategory = require('../model/learnScreenSchema');
        const mainCategory = await MainCategory.findById(mainCategoryId);
        if (!mainCategory) {
            return res.status(404).json({
                success: false,
                message: 'Main category not found'
            });
        }

        const subCategory = mainCategory.subCategorys.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Sub category not found'
            });
        }

        const topic = subCategory.topics.id(topicId);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        const entry = topic.entries.id(entryId);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }

        // Create and save the message with shared entry
        const newMessage = new Message({
            interestId,
            userId,
            message,
            isImportant: false,
            sharedEntry: {
                mainCategoryId,
                subCategoryId,
                topicId,
                entryId,
                title: entry.title,
                body: entry.body
            }
        });

        const savedMessage = await newMessage.save();

        // Populate the message with user details for response
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('userId', 'firstName lastName')
            .populate('interestId', 'name');

        const responseMessage = {
            ...populatedMessage.toObject(),
            userId: {
                _id: populatedMessage.userId._id,
                firstName: populatedMessage.userId.firstName,
                lastName: populatedMessage.userId.lastName
            }
        };

        // Emit the shared entry message to all clients in the interest group via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(interestId).emit('newSharedEntry', {
                success: true,
                message: responseMessage
            });
        }

        res.status(201).json({
            success: true,
            message: 'Entry shared successfully',
            data: responseMessage
        });

    } catch (error) {
        console.error('Error sharing entry:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getInterestUserCount = async (req, res) => {
    try {
        const { interestId } = req.params;

        if (!interestId) {
            return res.status(400).json({
                success: false,
                message: "Interest ID is required"
            });
        }

        // Find the interest and get user count
        const interest = await Interest.findById(interestId);
        
        if (!interest) {
            return res.status(404).json({
                success: false,
                message: "Interest not found"
            });
        }

        // Get the count of users in this interest (using correct field name 'userId')
        const userCount = interest.userId ? interest.userId.length : 0;

        res.status(200).json({
            success: true,
            data: {
                interestId: interest._id,
                interestName: interest.name,
                userCount: userCount,
                users: interest.userId || []
            }
        });

    } catch (error) {
        console.error("Get interest user count error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

module.exports = {
    sendMessage,
    sendImportantMessage,
    shareEntry,
    getInterestMessages,
    getInterestUserCount
};
