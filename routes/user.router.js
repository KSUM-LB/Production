const express = require('express');
const userController = require('../controllers/user.controller');
const tokenAuth = require('./../middlewares/tokenVerify');

const router = express.Router();

// -- Signup
router.post('/signup', userController.signup);
// -- Login
router.post('/login', userController.login);
// -- GetUserInfo
// router.get('/getUserInfo', tokenAuth.verifyAndDecode, userController.getUserInfo);
// -- Change password
router.patch('/changePassword', tokenAuth.verifyAndDecode, userController.changePassword)
// -- Logout
router.delete('/logout', tokenAuth.verifyAndDecode, userController.logout);


// // --- Check if a user is signed in
// router.get('/check', userController.checkLogin);

module.exports = router;