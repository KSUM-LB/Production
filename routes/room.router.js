const express = require('express');
const roomController = require('../controllers/room.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Room (super admin)
router.post('/create', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, roomController.createRoom);
// -- Get Rooms
router.get('/', roomController.getRooms);
// -- Edit Rooms  (super admin)
// router.patch('/edit', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.createCoupon);
// -- Edit Room Quantity
// router.patch('/editQuantity', tokenAuth.verifyAndDecode, auth.checkAdminAccess, roomController.editQuantity);
// -- Delete Room (super admin)
// router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.deleteCoupon);

module.exports = router;