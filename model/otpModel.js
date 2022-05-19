const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(

  {
    email:{
      type:String,
    },
    userId: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
