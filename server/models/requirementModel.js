const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema({
  _id: String,
  description: String,
  fix_suggestion: String,
  rule_ids: [String],
  test_ids: [String]
});

module.exports = mongoose.model("Requirement", requirementSchema);