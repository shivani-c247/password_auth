const User = require("../model/userOtpModel");
const Otp = require("../model/otpModel");
const { validationResult } = require("express-validator");
const { sendOtp } = require("../utils/helper");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const dotenv = require("dotenv");
dotenv.config();

exports.signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    const { username, email } = req.body;
    const newUser = new User({
      username,
      email,
    });
    newUser.save().then((result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "We are having some error while completing your request. Please try again after some time.",
      error: error,
    });
  }
};

exports.loginOtpSend = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    const { email } = req.body;
    const user = await User.findOne({ email }).then((result) => {
      sendOtp(result, res);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "We are having some error while completing your request. Please try again after some time.",
      error: error,
    });
  }
};

exports.loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    const userDetail = await Otp.find({
      email,
    });
    if (userDetail.length <= 0) {
      throw new Error(" otp has been expired");
    }
    const otpData = await Otp.findOne({ otp });
    const token = jwt.sign(
      { email: userDetail.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    if (otpData && userDetail) {
      await Otp.deleteMany({ email });
      res.status(200).json({
        type: "success",
        message: "welcome to our Website",
        token,
      });
    } else {
      res.status(400).json({
        type: "Failed",
        message: "you are using Incorrect OTP",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
};
