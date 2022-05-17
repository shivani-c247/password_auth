const User = require("../model/userModel");
const Otp = require("../model/otpModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
//const jwt = require("jsonwebtoken");
//const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();

exports.signup = async (req, res, next) => {
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
            message: "create error",
          });
        });
    });
  }
};

/*
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    const { username, email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await User.create({
      username,
      email,
      password: hashedPassword,
      address,
      contactNo
    });

    return res.status(200).json({
      success: true,
      message: "Data saved successfully.",
      data: userData,
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

*/

const sendOtp = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(100 + Math.random() * 9000)}`;

    let transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: "shivanipanwar318@gmail.com",
        pass: "Shivani@123",
      },
    });

    const mailOptions = {
      from: "shivanipanwar318@gmail.com",
      to: email,
      subject: "Verify your email",
      html: ` hello <br><p>Your One Time OTP is  ${otp} `,
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


exports.verify= async(req,res)=>{
  try{
const { userId,otp}=req.body;
if(!userId||!otp){
throw Error("Empty otp details are not sent");
  }
  else{
    const verification= await Otp.find({
      userId,

    })
    if(verification.length<=0){
      throw new Error("Account record does not  exist")
    }

    else{
      const {expiresAt} = verification[0];
      const hashedOTP=verification[0].otp;
      if(expiresAt<Date.now()){
        await Otp.deleteMany(userId);
        throw new Error("code has expired ,please request again")
      }
      else{
        const validOtp= await bcrypt.compare(otp,hashedOTP)
        if(!validOtp){
          throw new Error("Invalid code passes, please check your inbox")
        }
        else{
          await User.updateOne({_id:userId}, {verified:true})
          await Otp.deleteMany({userId});
          res.json({
            status:"VERIFIED",
            message:"User verified and login successfully"
          })
        }
      }
    }
  }
}
  catch(e){
    res.json({
      status: "FAILED",
      message: e.message,
    });
  }
  }

