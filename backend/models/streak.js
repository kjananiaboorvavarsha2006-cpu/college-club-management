const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: Date.now
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    totalActiveDays: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Streak', streakSchema);