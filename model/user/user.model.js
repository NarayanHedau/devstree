const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    email: { type: String  },
    password:{type:String},
    phone_number: { type: String },
    profile_image:{type:String},
    full_name: { type: String},
    dob: { type: Date}, 
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", User);
