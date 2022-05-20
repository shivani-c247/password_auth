const User = require("../model/userOtpModel");
const Otp = require("../model/otpModel");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    const login = new Otp({
      email,
    });
    login.save().then((result) => {
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

const sendOtp = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(100 + Math.random() * 9000)}`;
    let transporter = nodemailer.createTransport({
      port: process.env.PORT,
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "This is Your one time password",

      html: `${otp} is the one time password(OTP) for login and is valid for 6 mins. <br>
     <h> Please DO NOT share with anyone to keep your account safe<h>`,
    };
    const newOtp = await new Otp({
      email: email,
      userId: _id,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await newOtp.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "Otp has been send",
      date: {
        userId: _id,
        email,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: "FAILED",
      message: e.message,
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
      throw new Error("Otp has been Expired or u have already used it");
    }
    const otpData = await Otp.findOne({ otp });
    if (otpData && userDetail) {
      await Otp.deleteMany({ email });
      res.status(200).json({
        type: "success",
        message: "welcome to our Website",
      });
    } else {
      res.status(400).json({
        type: "Failed",
        message: "you are using Incorrect OTP",
      });
    }
  } catch (e) {
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
};
