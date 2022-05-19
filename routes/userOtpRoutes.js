const express = require("express");
const router = express.Router();
const userController = require("../controller/authController");
const validate=require("../controller/validator")

router.post("/login", userController.login);
router.post("/signup", validate.validate, userController.signUp);
router.post("/verify", userController.verify);

module.exports = router;
