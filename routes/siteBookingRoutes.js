const express = require('express');
const router = express.Router();
const siteBookingController = require('../controllers/siteBookingController');

// Create site booking
router.post('/site-booking', siteBookingController.createSiteBooking);

// Get all site bookings
router.get('/sitebookings', siteBookingController.getAllSiteBookings);

// Update site booking
router.put('/update-sitebooking/:id', siteBookingController.updateSiteBooking);

module.exports = router;
