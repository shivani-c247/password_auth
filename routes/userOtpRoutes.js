const express = require("express");
const router = express.Router();
const userController = require("../controller/authController");
const validate = require("../controller/validator");

router.post("/signup", validate.validate, userController.signUp);
router.post(
  "/loginOtpSend",
  validate.loginValidation,
  userController.loginOtpSend
);
router.post("/loginWithOtp", userController.loginWithOtp);

module.exports = router;
