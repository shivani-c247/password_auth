const User = require("../model/userOtpModel");
const Otp = require("../model/otpModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

exports.signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (username == "" || email == "" || password == "") {
    res.json({
      status: "failed",
      message: " field is empty",
    });
  } else {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds).then((hashedPassword) => {
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });
      newUser
        .save()
        .then((result) => {
          sendOtp(result, res);
        })
        .catch((e) => {
          console.log(e);
          res.json({
            status: "failed",
            message: "creating error",
          });
        });
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
      subject: "Verify your email",
      html: ` hello<br><p>Your One Time OTP is  ${otp}<br> <h1>valid only 6 min </h1>`,
    };
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOtp = await new Otp({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    //save otp records
    await newOtp.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "verification otp sent",
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
        const hashedOTP = verification[0].otp;
        if (expiresAt < Date.now()) {
          await Otp.deleteMany(userId);
          throw new Error("code has expired ,please request again");
        } else {
          const validOtp = await bcrypt.compare(otp, hashedOTP);
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
    }
  } catch (e) {
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
};
