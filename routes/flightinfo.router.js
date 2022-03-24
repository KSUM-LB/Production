const express = require('express');
const flightInfoController = require('../controllers/flightinfo.controller');
const tokenAuth = require('./../middlewares/tokenVerify');
const auth = require('./../middlewares/authorization');

const router = express.Router();

// -- Create Referal
router.post('/create', tokenAuth.verifyAndDecode, auth.checkAdminAccess, flightInfoController.createFlightInfoEmail);
// -- Get Referals
router.get('/', tokenAuth.verifyAndDecode, auth.checkAdminAccess, flightInfoController.getFlightInfoEmails);
// -- Delete Referals
router.delete('/delete/:id', tokenAuth.verifyAndDecode, auth.checkAdminAccess, flightInfoController.deleteFlightInfoEmail);

module.exports = router;