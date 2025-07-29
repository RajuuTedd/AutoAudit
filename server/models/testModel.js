const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  _id: String,
  name: String,
  tool: String,
  command: String,
  requirement_ids: [String]
});

module.exports = mongoose.model("Test", testSchema);