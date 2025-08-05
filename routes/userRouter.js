const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/forget-password/:resetToken').post(authController.resetPassword);

router
  .route('/update-password/')
  .post(authController.protect, authController.updatePassword);

router.use(authController.protect);
router.route('/me').get(userController.getUser);
router.route('/isLoggedIn').get(authController.isLoggedIn);

router
  .route('/updateMe')
  .post(userController.uploadPhoto, userController.updateMe);

router.route('/deleteMe').post(userController.deleteMe);

router.route('/').get(userController.getAllUsers);
router.route('/:id').delete(userController.deleteUser);

module.exports = router;
