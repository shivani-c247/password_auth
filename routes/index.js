const { Router } = require("express");

const userOtpRoute = require("./userOtpRoutes");
const magicLinkRoute = require("./magicLinkRoute");
const router = Router();

router.use("/api", userOtpRoute);
router.use("/api",magicLinkRoute);
module.exports = router;
