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
// router.get('/:userId', bookingController.getBookingFromQR);
// -- Get Single Booking
// router.get('/', tokenAuth.verifyAndDecode, roomController.getRooms);

module.exports = router;