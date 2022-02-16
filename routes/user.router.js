const express = require('express');
const userController = require('../controllers/user.controller');
// const tokenAuth = require('./../middleware/tokenVerify');

const router = express.Router();

// -- Signup
router.post('/signup', userController.signup);
// -- Login
router.post('/login', userController.login);
// -- GetUserInfo
// router.get('/getUserInfo', tokenAuth.verifyAndDecode, userController.getUserInfo);
// -- Logout
// router.delete('/logout', tokenAuth.verifyAndDecode, userController.logout);


// // --- Check if a user is signed in
// router.get('/check', userController.checkLogin);

module.exports = router;