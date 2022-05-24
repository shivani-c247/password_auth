const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  magic_link: {
    type: String,
    required: false,
    unique: false,
    default: uuidv4,
  },
  magicLinkExpired: {
    type: Boolean,
    default: false,
  },
});

const Magic = mongoose.model("Magic", UserSchema);
module.exports = Magic;
