const express = require('express');
const couponController = require('../controllers/coupon.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Coupon
router.post('/create', tokenAuth.verifyAndDecode, auth.checkAdminAccess, couponController.createCoupon);
// -- Get Coupons
router.get('/', tokenAuth.verifyAndDecode, auth.checkAdminAccess, couponController.getCoupons);
// -- Delete Coupon
router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkAdminAccess, couponController.deleteCoupon);

module.exports = router;