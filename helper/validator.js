const { body } = require("express-validator")

const login = () => {
    return [
        body("email").isString().withMessage("Email is required"),
        body("password").isString().withMessage("Password is required"),
    ]
}

const registration = () => {
    return [
        body("full_name").isString().withMessage("Full name is required"),
        body("dob").isString().withMessage("Date of birth is required"),
        body("email").isString().withMessage("Email is required with long, lat."),
        body("phone_number").isString().withMessage("Phone number is required"),
        body("password").isString().withMessage("Password is required with long, lat.")
    ]
}

module.exports = {
    login,
    registration
}