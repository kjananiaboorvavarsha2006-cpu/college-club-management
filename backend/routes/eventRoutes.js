const express = require('express');
const { 
    getEvents, 
    getUpcomingEvents, 
    getEvent, 
    createEvent, 
    updateEvent, 
    deleteEvent,
    getClubEvents
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router
    .route('/')
    .get(getEvents)
    .post(protect, createEvent);

router.get('/upcoming', protect, getUpcomingEvents);
router.get('/club/:clubId', getClubEvents);

router
    .route('/:id')
    .get(getEvent)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

module.exports = router;