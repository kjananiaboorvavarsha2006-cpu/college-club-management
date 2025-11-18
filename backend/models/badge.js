const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: [true, 'Please add a badge type'],
        enum: ['bronze', 'silver', 'gold', 'diamond', 'club-joiner', 'event-goer']
    },
    earnedDate: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can only earn each badge once
badgeSchema.index({ user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);