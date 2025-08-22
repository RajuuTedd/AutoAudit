const Test = require("../models/testModel");
const Requirement = require("../models/requirementModel");
const Rule = require("../models/ruleModel");
const Regulation = require("../models/regulationModel");

exports.buildReport = async (results) => {
  const enrichedResults = [];

  for (const result of results) {
    if (result.status === "FAIL") {
      const test = await Test.findOne({ name: result.testName });
      if (!test) continue;

      const requirements = await Requirement.find({ test_ids: test._id });
      const enrichedViolations = [];

      for (let req of requirements) {
        const relatedRules = await Rule.find({ _id: { $in: req.rule_ids } });
        const ruleDetails = [];

        for (let rule of relatedRules) {
          const regulation = await Regulation.findById(rule.regulation_id);
          ruleDetails.push({
            regulation: regulation?.name || "Unknown",
            article: rule.article_number,
            ruleTitle: rule.title,
            ruleDesc: rule.description,
          });
        }

        enrichedViolations.push({
          requirement: req.description,
          fix: req.fix_suggestion,
          related_rules: ruleDetails,
        });
      }

      enrichedResults.push({
        ...result,
        violations: enrichedViolations,
      });
    } else {
      enrichedResults.push(result);
    }
  }

  return {
    reportGeneratedAt: new Date(),
    tests: enrichedResults,
    summary: {
      passed: enrichedResults.filter((r) => r.status === "PASS").length,
      failed: enrichedResults.filter((r) => r.status === "FAIL").length,
      total: enrichedResults.length,
    },
  };
};
