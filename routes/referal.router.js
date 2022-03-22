const express = require('express');
const referalController = require('../controllers/referal.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Referal
router.post('/create', tokenAuth.verifyAndDecode, auth.checkSuperAdminAccess, referalController.createReferal);
// -- Get Referals
router.get('/', referalController.getReferals);
// -- Delete Referals
router.delete('/delete/:id', tokenAuth.verifyAndDecode, auth.checkAdminAccess, referalController.deleteReferal);

module.exports = router;