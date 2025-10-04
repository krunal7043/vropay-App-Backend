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
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    sharedEntry: {
        mainCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MainCategory'
        },
        subCategoryId: mongoose.Schema.Types.ObjectId,
        topicId: mongoose.Schema.Types.ObjectId,
        entryId: mongoose.Schema.Types.ObjectId,
        title: String,
        body: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);