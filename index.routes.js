const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
let jwt = require("jsonwebtoken");
let response = require("./helper/response")
require("./Database/db");
let secreteKey = "secreteKey"
let auth = require("./helper/auth")
let multer = require("multer");
let fs = require('fs')
require("./model/user/user.model");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
let saltRounds = 10;
const { validationResult } = require('express-validator');
const validator = require("./helper/validator")

let staticFilesUrl = "http://localhost:3000/"

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "./public/uploads");
    },
    filename: (req, file, callback) => {
      req.originalName = Date.now() + "-" + file.originalname;
      callback(null, req.originalName);
    },
  }),
}).any();

app.post("/upload", (req, res) => {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public')
  } else {
    if (!fs.existsSync('./public/uploads')) {
      fs.mkdirSync('./public/uploads')
    }
  }
  upload(req, res, (err) => {
    var files = [];
    req.files.forEach((ele) => {
      files.push(staticFilesUrl + ele.filename);
    });
    res.send({ status: "SUCCESS", files });
  });
});

app.post("/register", validator.registration(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userData = await User.findOne({
      email: req.body.email
    })
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

app.post("/login",  validator.login(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    let findUser = await User.findOne({ email: email });

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

app.get("/get/profile", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let userData = await User.findOne({ _id: userId }).select("-password -createdAt -updatedAt -__v")
    response.successResponse(res, 200, "User data fetched successfully", userData)
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.get("/getAll/users", auth.verify, async (req, res) => {
  try {
    let { search } = req.query;
    let result;
    if (search && search != "") {
      result = await User.find({ fullName: { $regex: search, $options: "i" } })
    }else{
      result = await User.find();
    }
    if (result.length != 0) {
      response.successResponse(res, 200, "", result);
    } else {
      response.successResponse(res, 200, "Not Found", result);
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})
app.listen(3000, () => {
  console.log("Port is Connected on 3000");
});




