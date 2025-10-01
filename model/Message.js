const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    interestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Interest'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);