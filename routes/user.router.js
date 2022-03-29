const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('./../middlewares/authorization');
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
// -- Delete Account
router.patch('/delete/:id', tokenAuth.verifyAndDecode, auth.checkAdminAccess, userController.deleteUser);
// -- Get Users
router.get('/getSubAccounts', tokenAuth.verifyAndDecode, auth.checkAdminAccess, userController.getUsers);
// -- GetUserInfo
router.get('/getUserInfo/:id', tokenAuth.verifyAndDecode, auth.checkAdminAccess, userController.getUserInfo);

module.exports = router;