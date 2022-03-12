const express = require('express');
const bookingController = require('../controllers/booking.controller');
const tokenAuth = require('../middlewares/tokenVerify');
const auth = require('../middlewares/authorization');

const router = express.Router();

// -- Create Booking
router.post('/create', tokenAuth.verifyAndDecode, bookingController.createBooking);
// -- Get Bookings
router.get('/', tokenAuth.verifyAndDecode, bookingController.getBooking);
// -- Get Single Booking
// router.get('/', tokenAuth.verifyAndDecode, roomController.getRooms);

module.exports = router;