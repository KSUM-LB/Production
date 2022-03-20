const express = require('express');
const tableController = require('../controllers/table.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Table (super admin)
router.post('/create', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, tableController.createTable);
// -- Get Tables
router.get('/', tableController.getTables);
// -- Edit Table
router.patch('/editTable', tokenAuth.verifyAndDecode, auth.checkAdminAccess, tableController.editTable);
// -- Table Sales Report
router.get('/report', tokenAuth.verifyAndDecode, auth.checkAdminAccess, tableController.tablesReport);
// -- Delete Table (super admin)
// router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, couponController.deleteCoupon);

module.exports = router;