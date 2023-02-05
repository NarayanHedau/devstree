let router = require("express").Router();
let multer = require("multer");
let config = require("../config.json");
let fs = require("fs");


let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "./uploads");
    },
    filename: (req, file, callback) => {
      req.originalName = Date.now() + "-" + file.originalname;
      callback(null, req.originalName);
    },
  }),
}).any(); // for multiple upload

router.post("/profile/image", (req, res) => {
  if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
  } else {
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }
  }
  upload(req, res, (err) => {
    var files = [];
    req.files.forEach((ele) => {
      files.push(config.staticFilesUrl + ele.filename);
    });
    res.send({ status: "SUCCESS", files });
  });
});

module.exports = router;
