const express = require('express');
const tableController = require('../controllers/table.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Table (super admin)
router.post('/create', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, tableController.createTable);
// -- Get Tables
router.get('/', tokenAuth.verifyAndDecode, tableController.getTables);
// -- Edit Rooms  (super admin)
// router.patch('/edit', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.createCoupon);
// -- Edit Table Size
router.patch('/editSize', tokenAuth.verifyAndDecode, auth.checkAdminAccess, tableController.editSize);
// -- Edit Note
router.patch('/editNote', tokenAuth.verifyAndDecode, auth.checkAdminAccess, tableController.editNote);
// -- Delete Room (super admin)
// router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.deleteCoupon);

module.exports = router;