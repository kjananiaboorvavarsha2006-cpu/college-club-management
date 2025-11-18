const User = require('../models/user');
const Membership = require('../models/membership');
const Event = require('../models/event');
const Streak = require('../models/streak');
const Badge = require('../models/badge');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Get user's clubs
        const memberships = await Membership.find({
            user: req.user.id,
            isActive: true
        }).populate('club', 'name');
        
        // Get user's events
        const events = await Event.find({
            attendees: req.user.id
        }).populate('club', 'name');
        
        // Get user's streak
        const streak = await Streak.findOne({ user: req.user.id });
        
        // Get user's badges
        const badges = await Badge.find({ user: req.user.id });
        
        // Get user's activity
        const activity = await getUserActivity(req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                major: user.major,
                role: user.role,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                clubs: memberships.map(m => m.club),
                clubsCount: memberships.length,
                events: events,
                eventsCount: events.length,
                currentStreak: streak ? streak.currentStreak : 0,
                badges: badges,
                badgesCount: badges.length,
                activity: activity
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, studentId, major } = req.body;
        
        // Build update object
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (email) fieldsToUpdate.email = email;
        if (studentId) fieldsToUpdate.studentId = studentId;
        if (major) fieldsToUpdate.major = major;
        
        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        );
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user activity
// @route   GET /api/profile/activity
// @access  Private
exports.getUserActivity = async (req, res, next) => {
    try {
        const activity = await getUserActivity(req.user.id);
        
        res.status(200).json({
            success: true,
            data: activity
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to get user activity
async function getUserActivity(userId) {
    const activity = [];
    
    // Get memberships
    const memberships = await Membership.find({ user: userId })
        .populate('club', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    
    for (const membership of memberships) {
        activity.push({
            type: membership.isActive ? 'joined_club' : 'left_club',
            description: membership.isActive 
                ? `Joined ${membership.club.name}` 
                : `Left ${membership.club.name}`,
            date: membership.isActive ? membership.joinDate : membership.leaveDate
        });
    }
    
    // Get event attendance
    const events = await Event.find({ attendees: userId })
        .populate('club', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    
    for (const event of events) {
        activity.push({
            type: 'joined_event',
            description: `Attended ${event.title} by ${event.club.name}`,
            date: event.createdAt
        });
    }
    
    // Get badges
    const badges = await Badge.find({ user: userId })
        .sort({ earnedDate: -1 })
        .limit(10);
    
    for (const badge of badges) {
        let badgeName = '';
        switch(badge.type) {
            case 'bronze':
                badgeName = 'Bronze Badge';
                break;
            case 'silver':
                badgeName = 'Silver Badge';
                break;
            case 'gold':
                badgeName = 'Gold Badge';
                break;
            case 'diamond':
                badgeName = 'Diamond Badge';
                break;
            case 'club-joiner':
                badgeName = 'Club Joiner Badge';
                break;
            case 'event-goer':
                badgeName = 'Event Goer Badge';
                break;
        }
        
        activity.push({
            type: 'earned_badge',
            description: `Earned ${badgeName}`,
            date: badge.earnedDate
        });
    }
    
    // Sort by date (newest first) and return
    return activity.sort((a, b) => new Date(b.date) - new Date(a.date));
}