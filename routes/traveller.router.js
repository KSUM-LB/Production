const express = require('express');
const travellerController = require('../controllers/traveller.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Traveller
router.post('/create', tokenAuth.verifyAndDecode, travellerController.createTraveller);
// -- Get Rooms
// router.get('/', tokenAuth.verifyAndDecode, roomController.getRooms);
// -- Edit Rooms  (super admin)
// router.patch('/edit', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.createCoupon);
// -- Edit Room Quantity
// router.patch('/editQuantity', tokenAuth.verifyAndDecode, auth.checkAdminAccess, roomController.editQuantity);
// -- Delete Room (super admin)
// router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.deleteCoupon);

module.exports = router;