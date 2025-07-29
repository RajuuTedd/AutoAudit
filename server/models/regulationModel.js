const mongoose = require("mongoose");

const regulationSchema = new mongoose.Schema({
  _id: String,
  name: String,
  jurisdiction: String,
  version: String,
  description: String
});

module.exports = mongoose.model("Regulation", regulationSchema);