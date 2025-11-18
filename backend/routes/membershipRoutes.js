const express = require('express');
const { 
    joinClub, 
    leaveClub, 
    getUserMemberships 
} = require('../controllers/membershipController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/join/:clubId', protect, joinClub);
router.post('/leave/:clubId', protect, leaveClub);
router.get('/user', protect, getUserMemberships);

module.exports = router;