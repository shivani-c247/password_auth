const { body } = require("express-validator");
const User = require("../model/userOtpModel");

exports.validate = [
    body("username")
    .not()
    .isEmpty()
    .withMessage("username is required")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("username is already present");
      }
    }),
    body("email")
      .not()
      .isEmpty()
      .withMessage("email is required")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("email is already taken");
        }
      }),
     ];
  

     exports.verifyValidation = [
        body("username")
        .not()
        .isEmpty()
        .withMessage("username is required")
        .custom(async (value) => {
          const user = await User.findOne({ username: value });
          if (user) {
            throw new Error("username is already present");
          }
        }),
        
]