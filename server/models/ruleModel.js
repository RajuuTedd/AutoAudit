const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  _id: String,
  regulation_id: String,
  article_number: String,
  title: String,
  description: String,
  requirement_ids: [String]
});

module.exports = mongoose.model("Rule", ruleSchema);