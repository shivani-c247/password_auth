const router = require("express").Router();
const controller = require("../controller/userMagicLink");

router.post("/signUpLogin", controller.login);

module.exports = router;
