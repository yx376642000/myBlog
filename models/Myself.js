var mongoose = require("mongoose");
var myselfSchema = require("../schemas/myself");

module.exports = mongoose.model("Myself",myselfSchema);