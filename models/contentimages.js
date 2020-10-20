var mongoose = require("mongoose");

var ContentImageSchema = new mongoose.Schema({
    name: String,
    img: {
        data: Buffer,
        contentType: String
    },
    author: String
});

module.exports = mongoose.model("ContentImage", ContentImageSchema);