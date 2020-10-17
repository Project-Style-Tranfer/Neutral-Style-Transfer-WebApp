var mongoose = require("mongoose");

var OtpSchema = new mongoose.Schema({
    email: String,
    otp: String
});

module.exports = mongoose.model("Otp", OtpSchema);