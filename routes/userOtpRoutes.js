const express = require("express");
const router = express.Router();
const userController = require("../controller/authController");

router.post("/signup", userController.signUp);
router.post("/verify", userController.verify);

module.exports = router;
