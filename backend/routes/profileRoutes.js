const express = require('express');
const { 
    getProfile, 
    updateProfile, 
    getUserActivity 
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, getProfile);
put('/update', protect, updateProfile);
get('/activity', protect, getUserActivity);

module.exports = router;