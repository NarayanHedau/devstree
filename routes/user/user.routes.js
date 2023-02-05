let router = require("express").Router();
let response = require("../../helper/response");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const auth = require("../../helper/auth");
const bcrypt = require("bcrypt");
let saltRounds = 10;
let jwt = require("jsonwebtoken");
let secreteKey = "secreteKey"
const { validationResult } = require('express-validator');
const validator = require("../../helper/validator")

router.post("/register", validator.registration(), async (req, res) => {
  try {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const userData = await User.findOne({email: req.body.email})
    if (userData) {
      response.errorMsgResponse(res, 201, "User already registerd")
    } else {
      let data = req.body;
      bcrypt.genSalt(saltRounds, async function (err, salt) {
        bcrypt.hash(data.password, salt, async function (err, hash) {
          data["password"] = hash;
          var user = await new User(data).save();
          if (user) {
            response.successResponse(res, 201, "User registerd successfully", user)
          } else {
            response.errorMsgResponse(res, 301, "Something went wrong")
          }
        })
      });
    }
  } catch (error) {
    console.log(error)
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

router.post("/login", validator.login(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email,  password } = req.body;
    let findUser = await User.findOne({ email: email});

    if (!findUser) {
      response.errorMsgResponse(res, 400, "email not found")
    } else {
      findUser = JSON.parse(JSON.stringify(findUser));
      let matchPasword = await bcrypt.compare(password, findUser.password);
      if (matchPasword) {
        let token = await jwt.sign(findUser, secreteKey, {
          expiresIn: "24h",
        });
        findUser["token"] = `Bearer ${token}`;
        response.successResponse(res, 200, "User login successfully", findUser)
      } else {
        response.errorMsgResponse(res, 400, "email or password is incorrect")
      }
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
});

router.get("/get/profile", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let userData = await User.findOne({ _id: userId }).select("-password -createdAt -updatedAt -__v")
    response.successResponse(res, 200, "User data fetched successfully", userData)
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})


router.get("/getAll/users", auth.verify, async (req, res) => {
  try {
    let { search } = req.query;
    let result;
    if (search && search != "") {
      result = await User.find({ full_name: { $regex: search, $options: "i" } }).select("-password");
    } else {
      result = await User.find().select("-password");
    }
    if (result.length != 0) {
      response.successResponse(res, 200, "User data retrived successfully", result);
    } else {
      response.errorMsgResponse(res, 404, "Not Found")
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

module.exports = router;
