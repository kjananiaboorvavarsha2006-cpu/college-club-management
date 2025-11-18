const Streak = require('../models/streak');
const Badge = require('../models/badge');

// Update user streak
exports.updateStreak = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = await Streak.findOne({ user: userId });
        
        if (!streak) {
            // Create streak record if it doesn't exist
            streak = await Streak.create({
                user: userId,
                currentStreak: 1,
                totalActiveDays: 1,
                lastActiveDate: today
            });
            
            // Check for bronze badge
            await checkAndAwardBadge(userId, 'bronze');
            
            return streak;
        }
        
        const lastActive = new Date(streak.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Already active today
            return streak;
        } else if (diffDays === 1) {
            // Consecutive day
            streak.currentStreak += 1;
            streak.totalActiveDays += 1;
            
            // Update longest streak if needed
            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }
            
            // Check for badges
            await checkAndAwardBadge(userId, streak.currentStreak);
        } else {
            // Reset streak
            streak.currentStreak = 1;
            streak.totalActiveDays += 1;
        }
        
        streak.lastActiveDate = today;
        await streak.save();
        
        return streak;
    } catch (error) {
        console.error('Error updating streak:', error);
        throw error;
    }
};

// Check and award badge based on streak
async function checkAndAwardBadge(userId, streak) {
    try {
        // Check for streak badges
        if (streak >= 3) {
            const existingBronze = await Badge.findOne({ user: userId, type: 'bronze' });
            if (!existingBronze) {
                await Badge.create({
                    user: userId,
                    type: 'bronze'
                });
            }
        }
        
        if (streak >= 7) {
            const existingSilver = await Badge.findOne({ user: userId, type: 'silver' });
            if (!existingSilver) {
                await Badge.create({
                    user: userId,
                    type: 'silver'
                });
            }
        }
        
        if (streak >= 15) {
            const existingGold = await Badge.findOne({ user: userId, type: 'gold' });
            if (!existingGold) {
                await Badge.create({
                    user: userId,
                    type: 'gold'
                });
            }
        }
        
        if (streak >= 30) {
            const existingDiamond = await Badge.findOne({ user: userId, type: 'diamond' });
            if (!existingDiamond) {
                await Badge.create({
                    user: userId,
                    type: 'diamond'
                });
            }
        }
    } catch (error) {
        console.error('Error checking and awarding badge:', error);
        throw error;
    }
}

// Check and award club joiner badge
exports.checkClubJoinerBadge = async (userId) => {
    try {
        const Membership = require('../models/membership');
        
        const clubCount = await Membership.countDocuments({
            user: userId,
            isActive: true
        });
        
        if (clubCount >= 5) {
            const existingBadge = await Badge.findOne({ user: userId, type: 'club-joiner' });
            if (!existingBadge) {
                await Badge.create({
                    user: userId,
                    type: 'club-joiner'
                });
            }
        }
    } catch (error) {
        console.error('Error checking club joiner badge:', error);
        throw error;
    }
};

// Check and award event goer badge
exports.checkEventGoerBadge = async (userId) => {
    try {
        const Event = require('../models/event');
        
        const eventCount = await Event.countDocuments({
            attendees: userId
        });
        
        if (eventCount >= 10) {
            const existingBadge = await Badge.findOne({ user: userId, type: 'event-goer' });
            if (!existingBadge) {
                await Badge.create({
                    user: userId,
                    type: 'event-goer'
                });
            }
        }
    } catch (error) {
        console.error('Error checking event goer badge:', error);
        throw error;
    }
};