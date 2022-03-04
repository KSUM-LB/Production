const express = require('express');
const bookingController = require('../controllers/booking.controller');
const tokenAuth = require('../middlewares/tokenVerify');
const auth = require('../middlewares/authorization');

const router = express.Router();

// -- Create Booking
router.post('/create', tokenAuth.verifyAndDecode, bookingController.createBooking);
// -- Get Bookings (admin)
// router.get('/', tokenAuth.verifyAndDecode, roomController.getRooms);
// -- Get Single Booking
// router.get('/', tokenAuth.verifyAndDecode, roomController.getRooms);

// -- Edit Rooms  (super admin)
// router.patch('/edit', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.createCoupon);
// -- Edit Room Quantity
// router.patch('/editQuantity', tokenAuth.verifyAndDecode, auth.checkAdminAccess, roomController.editQuantity);
// -- Delete Room (super admin)
// router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.deleteCoupon);

module.exports = router;