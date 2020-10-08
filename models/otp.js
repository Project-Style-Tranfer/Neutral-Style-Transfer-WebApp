var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var OtpSchema = new mongoose.Schema({
    email: String,
    otp: String
});

OtpSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Otp", OtpSchema);