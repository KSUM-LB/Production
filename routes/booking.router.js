const express = require('express');
const bookingController = require('../controllers/booking.controller');
const tokenAuth = require('../middlewares/tokenVerify');
const checkBooking = require('../middlewares/booking');
const auth = require('../middlewares/authorization');

const router = express.Router();

// -- Create Booking
router.post('/create', tokenAuth.verifyAndDecode, checkBooking.checkBooking, bookingController.createBooking);
router.post('/create/addFlightInfo', tokenAuth.verifyAndDecode, bookingController.addFlightInfo);
// router.post('/create/payNow', tokenAuth.verifyAndDecode, bookingController.payNow);
// -- Get Single Booking
router.get('/', tokenAuth.verifyAndDecode, bookingController.getBooking);
router.get('/getBooking', tokenAuth.verifyAndDecode, auth.checkAdminAccess, bookingController.getBookingAdmin);
// router.get('/:userId', bookingController.getBookingFromQR);
// -- Get All Bookings
router.get('/all', tokenAuth.verifyAndDecode, auth.checkAdminAccess, bookingController.getBookings);

module.exports = router;