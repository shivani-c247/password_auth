const { Router } = require("express");

const registrationRoute = require("./userRoutes");
const magicRoute = require("./magicRoute");
const router = Router();

//router.use("/api/products", productRoute);
//router.use("/api/category", categoryRoute);
//router.use("/api/cart", cartRoute);
//router.use("/api/order", orderRoute);
router.use("/api", registrationRoute);
router.use("/api",magicRoute);
module.exports = router;
