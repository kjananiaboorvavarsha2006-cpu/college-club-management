const Club = require('../models/Club');
const Membership = require('../models/membership');
const emailService = require('../utils/emailservice');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
exports.getClubs = async (req, res, next) => {
    try {
        const clubs = await Club.find().populate('creator', 'name');
        
        res.status(200).json({
            success: true,
            count: clubs.length,
            data: clubs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
exports.getClub = async (req, res, next) => {
    try {
        const club = await Club.findById(req.params.id).populate('creator', 'name');
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: club
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private
exports.createClub = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.creator = req.user.id;
        
        const club = await Club.create(req.body);
        
        // Add creator as a member
        await Membership.create({
            user: req.user.id,
            club: club._id
        });
        
        res.status(201).json({
            success: true,
            data: club
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private
exports.updateClub = async (req, res, next) => {
    try {
        let club = await Club.findById(req.params.id);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Make sure user is club creator or admin
        if (club.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this club'
            });
        }
        
        club = await Club.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            data: club
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private
exports.deleteClub = async (req, res, next) => {
    try {
        const club = await Club.findById(req.params.id);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Make sure user is club creator or admin
        if (club.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this club'
            });
        }
        
        await club.remove();
        
        // Remove all memberships for this club
        await Membership.deleteMany({ club: req.params.id });
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get club members
// @route   GET /api/clubs/:id/members
// @access  Public
exports.getClubMembers = async (req, res, next) => {
    try {
        const memberships = await Membership.find({ 
            club: req.params.id, 
            isActive: true 
        }).populate('user', 'name studentId major');
        
        res.status(200).json({
            success: true,
            count: memberships.length,
            data: memberships
        });
    } catch (error) {
        next(error);
    }
};