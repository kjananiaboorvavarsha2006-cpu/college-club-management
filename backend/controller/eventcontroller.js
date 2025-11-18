const Event = require('../models/event');
const Club = require('../models/Club');
const Membership = require('../models/membership');
const emailService = require('../utils/emailservice');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
    try {
        const events = await Event.find().populate('club', 'name');
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
exports.getUpcomingEvents = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const events = await Event.find({
            date: { $gte: today }
        })
        .populate('club', 'name')
        .sort({ date: 1 });
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('club', 'name');
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res, next) => {
    try {
        // Check if user is a member of the club or admin
        const membership = await Membership.findOne({
            user: req.user.id,
            club: req.body.clubId,
            isActive: true
        });
        
        const club = await Club.findById(req.body.clubId);
        
        if (!membership && club.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create events for this club'
            });
        }
        
        // Create event
        const event = await Event.create({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time,
            location: req.body.location,
            club: req.body.clubId
        });
        
        // Get all club members to notify
        const clubMembers = await Membership.find({
            club: req.body.clubId,
            isActive: true
        }).populate('user', 'email name');
        
        // Send notification emails
        for (const member of clubMembers) {
            try {
                await emailService.sendEventNotification(
                    member.user.email,
                    member.user.name,
                    event.title,
                    club.name
                );
            } catch (error) {
                console.error('Error sending event notification:', error);
            }
        }
        
        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Check if user is a member of the club or admin
        const membership = await Membership.findOne({
            user: req.user.id,
            club: event.club,
            isActive: true
        });
        
        const club = await Club.findById(event.club);
        
        if (!membership && club.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }
        
        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Check if user is a member of the club or admin
        const membership = await Membership.findOne({
            user: req.user.id,
            club: event.club,
            isActive: true
        });
        
        const club = await Club.findById(event.club);
        
        if (!membership && club.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }
        
        await event.remove();
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get events for a specific club
// @route   GET /api/events/club/:clubId
// @access  Public
exports.getClubEvents = async (req, res, next) => {
    try {
        const events = await Event.find({
            club: req.params.clubId
        }).populate('club', 'name');
        
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};