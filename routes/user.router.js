const express = require('express');
const userController = require('../controllers/user.controller');
const tokenAuth = require('./../middlewares/tokenVerify');

const router = express.Router();

// -- Signup
router.post('/signup', userController.signup);
// -- Login
router.post('/login', userController.login);
// -- Change password
router.patch('/changePassword', tokenAuth.verifyAndDecode, userController.changePassword);
// -- Logout
router.delete('/logout', tokenAuth.verifyAndDecode, userController.logout);

// -- GetUserInfo
// router.get('/getUserInfo', tokenAuth.verifyAndDecode, userController.getUserInfo);

module.exports = router;