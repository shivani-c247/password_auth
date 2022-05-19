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

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    res.status(200).json({
      message: "login",
    });
  }
  if (!user) {
    res.status(400).json({
      message: "user not found",
    });
    return;
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
      html: ` hello<br><p>Your One Time OTP is  ${otp}<br> <h1>valid only 6 min </h1>`,
    };
    const newOtp = await new Otp({
      userId: _id,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    //save otp records
    await newOtp.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "otp has been send",
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

exports.verify = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    } else {
      const userDetail = await Otp.find({
        userId,
      });
      if (userDetail.length <= 0) {
        throw new Error(
          "Account record does not  exist you can  use only One time Otp"
        );
      }
      const otpData = await Otp.findOne({ otp });
      if (otpData && userDetail) {
        await User.updateOne({ _id: userId }, { verified: true });
        await Otp.deleteMany({ userId });
        res.status(200).json({
          type: "success",
          message: "welcome",
        });
      } else {
        res.status(400).json({
          type: "Failed",
          message: "you sre using Incorrect OTP",
        });
      }
    }
  } catch (e) {
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
};

/*
exports.verify = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      throw Error("Empty otp details are not sent");
    } else {
      const verification = await Otp.find({
        userId,
      });
      if (verification.length <= 0) {
        throw new Error(
          "Account record does not  exist you can  use only One time Otp"
        );
      } else {
        const { expiresAt } = verification[0];
       // const hashedOTP = verification[0].otp;
        if (expiresAt < Date.now()) {
          await Otp.deleteMany(userId);
          throw new Error("code has expired ,please request again");
        } else {
          //const validOtp = await bcrypt.compare(otp, hashedOTP);
          if (!otp) {
            throw new Error("Invalid code passes, please check your inbox");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await Otp.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "User verified and login successfully welcome to out website",
            });
          }
        }
      }
    }
  } catch (e) {
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
};

*/

/*
exports.verify = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      throw Error("Empty otp details are not sent");
    } else {
      const verification = await Otp.find({
        userId,
      });
      if (verification.length <= 0) {
        throw new Error(
          "Account record does not  exist you can  use only One time Otp"
        );
      } else {
        const { expiresAt } = verification[0];
       // const hashedOTP = verification[0].otp;
        if (expiresAt < Date.now()) {
          await Otp.deleteMany(userId);
          throw new Error("code has expired ,please request again");
        } 
          if (!validOtp) {
            throw new Error("Invalid code passes, please check your inbox");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await Otp.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "User verified and login successfully welcome to out website",
            });
          }
        }
      
    }
  } catch (e) {
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
};
*/
