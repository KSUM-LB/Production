const express = require("express");
const bookingController = require("../controllers/booking.controller");
const tokenAuth = require("../middlewares/tokenVerify");
const checkBooking = require("../middlewares/booking");
const auth = require("../middlewares/authorization");

const router = express.Router();

// -- Get All Bookings
router.get(
  "/bookingsAll",
  tokenAuth.verifyAndDecode,
  auth.checkAdminAccess,
  bookingController.getBookingss
);
// -- Create Booking
router.post(
  "/create",
  tokenAuth.verifyAndDecode,
  checkBooking.checkBooking,
  bookingController.createBooking
);
// -- Add Flight Info
router.post(
  "/create/addFlightInfo",
  tokenAuth.verifyAndDecode,
  bookingController.addFlightInfo
);
// -- Pay Now
router.post(
  "/create/payNow",
  tokenAuth.verifyAndDecode,
  bookingController.payNow
);
// -- Get Single Booking
router.get("/", tokenAuth.verifyAndDecode, bookingController.getBooking);
// -- Get Single Booking Admin
router.get(
  "/getBooking/:userId/:bookingId",
  tokenAuth.verifyAndDecode,
  auth.checkAdminAccess,
  bookingController.getBookingAdmin
);
// -- Get From QR
router.get("/:userId", bookingController.getFromQR);
// Update Booking
router.patch(
  "/update",
  tokenAuth.verifyAndDecode,
  auth.checkAdminAccess,
  bookingController.updateBooking
);
// Pay Cash
router.patch(
  "/payCash",
  tokenAuth.verifyAndDecode,
  auth.checkAdminAccess,
  bookingController.payCash
);
// Send Email
router.post("/sendReceiptEmail", bookingController.sendReceiptEmail);

module.exports = router;
