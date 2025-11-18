const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    club: {
        type: mongoose.Schema.ObjectId,
        ref: 'Club',
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    leaveDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Compound index to ensure a user can only have one active membership per club
membershipSchema.index({ user: 1, club: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('Membership', membershipSchema);