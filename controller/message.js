const Message = require('../model/Message');
const Interest = require('../model/Interest');
const User = require('../model/userSchema');

// POST /api/messages - Send a message to an interest group
const sendMessage = async (req, res) => {
    try {
        const { interestId, message } = req.body;
        const userId = req.userId; // Get userId from token

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

        // Create and save the message
        const newMessage = new Message({
            interestId,
            userId,
            message
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

module.exports = {
    sendMessage,
    getInterestMessages
};
