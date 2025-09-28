const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Interest', interestSchema);