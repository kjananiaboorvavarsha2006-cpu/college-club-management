const express = require('express');
const { 
    getDashboardStats,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllClubs,
    createClub,
    updateClub,
    deleteClub,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);

router
    .route('/users')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);

router
    .route('/clubs')
    .get(getAllClubs)
    .post(createClub);

router
    .route('/clubs/:id')
    .put(updateClub)
    .delete(deleteClub);

router
    .route('/events')
    .get(getAllEvents)
    .post(createEvent);

router
    .route('/events/:id')
    .put(updateEvent)
    .delete(deleteEvent);

module.exports = router;