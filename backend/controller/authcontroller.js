const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Streak = require('../models/streak');
const config = require('../config');
const emailService = require('../utils/emailservice');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
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
            major
        });

        // Create streak record for user
        await Streak.create({
            user: user._id
        });

        // Send verification email
        const verificationToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
        
        try {
            await emailService.sendVerificationEmail(user.email, verificationUrl);
        } catch (error) {
            console.error('Error sending verification email:', error);
        }

        // Create token
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                major: user.major,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = await Streak.findOne({ user: user._id });
        
        if (streak) {
            const lastActive = new Date(streak.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);
            
            const diffTime = Math.abs(today - lastActive);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                streak.currentStreak += 1;
                streak.totalActiveDays += 1;
                
                // Update longest streak if needed
                if (streak.currentStreak > streak.longestStreak) {
                    streak.longestStreak = streak.currentStreak;
                }
                
                // Check for badges
                await checkAndAwardBadges(user._id, streak.currentStreak);
            } else if (diffDays > 1) {
                // Reset streak
                streak.currentStreak = 1;
                streak.totalActiveDays += 1;
            }
            
            streak.lastActiveDate = new Date();
            await streak.save();
        }

        // Create token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                major: user.major,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const token = req.params.token;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            user.emailVerified = true;
            await user.save();
            
            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Helper function to check and award badges
async function checkAndAwardBadges(userId, streak) {
    const Badge = require('../models/badge');
    
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
}