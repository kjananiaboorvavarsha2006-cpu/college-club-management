const express = require('express');
const { 
    getClubs, 
    getClub, 
    createClub, 
    updateClub, 
    deleteClub,
    getClubMembers
} = require('../controllers/clubController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router
    .route('/')
    .get(getClubs)
    .post(protect, createClub);

router
    .route('/:id')
    .get(getClub)
    .put(protect, updateClub)
    .delete(protect, deleteClub);

router.get('/:id/members', getClubMembers);

module.exports = router;