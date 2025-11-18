const User = require('../models/user');
const Club = require('../models/Club');
const Event = require('../models/event');
const Membership = require('../models/membership');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'user' });
        const totalClubs = await Club.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalMemberships = await Membership.countDocuments({ isActive: true });
        
        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalClubs,
                totalEvents,
                totalMemberships
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' });
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, studentId, major } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        
        // Check if student ID exists
        const existingStudentId = await User.findOne({ studentId });
        if (existingStudentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID already exists'
            });
        }
        
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            studentId,
            major,
            role: 'user'
        });
        
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        
        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await user.remove();
        
        // Remove all memberships for this user
        await Membership.deleteMany({ user: req.params.id });
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all clubs (admin)
// @route   GET /api/admin/clubs
// @access  Private/Admin
exports.getAllClubs = async (req, res, next) => {
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

// @desc    Create club (admin)
// @route   POST /api/admin/clubs
// @access  Private/Admin
exports.createClub = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.creator = req.user.id;
        
        const club = await Club.create(req.body);
        
        res.status(201).json({
            success: true,
            data: club
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update club (admin)
// @route   PUT /api/admin/clubs/:id
// @access  Private/Admin
exports.updateClub = async (req, res, next) => {
    try {
        let club = await Club.findById(req.params.id);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
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

// @desc    Delete club (admin)
// @route   DELETE /api/admin/clubs/:id
// @access  Private/Admin
exports.deleteClub = async (req, res, next) => {
    try {
        const club = await Club.findById(req.params.id);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
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

// @desc    Get all events (admin)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEvents = async (req, res, next) => {
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

// @desc    Create event (admin)
// @route   POST /api/admin/events
// @access  Private/Admin
exports.createEvent = async (req, res, next) => {
    try {
        const event = await Event.create({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time,
            location: req.body.location,
            club: req.body.clubId
        });
        
        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update event (admin)
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
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

// @desc    Delete event (admin)
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
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