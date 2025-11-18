const Membership = require('../models/membership');
const Club = require('../models/Club');
const User = require('../models/user');
const emailService = require('../utils/emailservice');

// @desc    Join a club
// @route   POST /api/memberships/join/:clubId
// @access  Private
exports.joinClub = async (req, res, next) => {
    try {
        const clubId = req.params.clubId;
        const userId = req.user.id;
        
        // Check if club exists
        const club = await Club.findById(clubId);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Check if user is already a member
        const existingMembership = await Membership.findOne({
            user: userId,
            club: clubId,
            isActive: true
        });
        
        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this club'
            });
        }
        
        // Check if user has a previous inactive membership
        const previousMembership = await Membership.findOne({
            user: userId,
            club: clubId,
            isActive: false
        });
        
        if (previousMembership) {
            // Reactivate membership
            previousMembership.isActive = true;
            previousMembership.joinDate = new Date();
            previousMembership.leaveDate = undefined;
            await previousMembership.save();
            
            // Add user to club members
            club.members.push(userId);
            await club.save();
            
            // Send notification to club creator
            const creator = await User.findById(club.creator);
            try {
                await emailService.sendMembershipNotification(
                    creator.email,
                    creator.name,
                    req.user.name,
                    club.name,
                    'joined'
                );
            } catch (error) {
                console.error('Error sending membership notification:', error);
            }
            
            res.status(200).json({
                success: true,
                message: 'Successfully joined the club'
            });
        } else {
            // Create new membership
            const membership = await Membership.create({
                user: userId,
                club: clubId
            });
            
            // Add user to club members
            club.members.push(userId);
            await club.save();
            
            // Send notification to club creator
            const creator = await User.findById(club.creator);
            try {
                await emailService.sendMembershipNotification(
                    creator.email,
                    creator.name,
                    req.user.name,
                    club.name,
                    'joined'
                );
            } catch (error) {
                console.error('Error sending membership notification:', error);
            }
            
            res.status(201).json({
                success: true,
                data: membership
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Leave a club
// @route   POST /api/memberships/leave/:clubId
// @access  Private
exports.leaveClub = async (req, res, next) => {
    try {
        const clubId = req.params.clubId;
        const userId = req.user.id;
        
        // Check if club exists
        const club = await Club.findById(clubId);
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Check if user is a member
        const membership = await Membership.findOne({
            user: userId,
            club: clubId,
            isActive: true
        });
        
        if (!membership) {
            return res.status(400).json({
                success: false,
                message: 'You are not a member of this club'
            });
        }
        
        // Check if user is the club creator
        if (club.creator.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'Club creator cannot leave the club'
            });
        }
        
        // Deactivate membership
        membership.isActive = false;
        membership.leaveDate = new Date();
        await membership.save();
        
        // Remove user from club members
        club.members = club.members.filter(
            member => member.toString() !== userId
        );
        await club.save();
        
        // Send notification to club creator
        const creator = await User.findById(club.creator);
        try {
            await emailService.sendMembershipNotification(
                creator.email,
                creator.name,
                req.user.name,
                club.name,
                'left'
            );
        } catch (error) {
            console.error('Error sending membership notification:', error);
        }
        
        res.status(200).json({
            success: true,
            message: 'Successfully left the club'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user memberships
// @route   GET /api/memberships/user
// @access  Private
exports.getUserMemberships = async (req, res, next) => {
    try {
        const memberships = await Membership.find({
            user: req.user.id,
            isActive: true
        }).populate('club', 'name description category');
        
        res.status(200).json({
            success: true,
            count: memberships.length,
            data: memberships
        });
    } catch (error) {
        next(error);
    }
};