// const Test = require("../models/testModel");
// const Requirement = require("../models/requirementModel");
// const Rule = require("../models/ruleModel");
// const Regulation = require("../models/regulationModel");

// exports.buildReport = async (results) => {
//   const enrichedResults = [];

//   for (const result of results) {
//     if (result.status === "FAIL") {
//       const test = await Test.findOne({ name: result.testName });
//       if (!test) continue;

//       const requirements = await Requirement.find({ test_ids: test._id });
//       const enrichedViolations = [];

//       for (let req of requirements) {
//         const relatedRules = await Rule.find({ _id: { $in: req.rule_ids } });
//         const ruleDetails = [];

//         for (let rule of relatedRules) {
//           const regulation = await Regulation.findById(rule.regulation_id);
//           ruleDetails.push({
//             regulation: regulation?.name || "Unknown",
//             article: rule.article_number,
//             ruleTitle: rule.title,
//             ruleDesc: rule.description,
//           });
//         }

//         enrichedViolations.push({
//           requirement: req.description,
//           fix: req.fix_suggestion,
//           related_rules: ruleDetails,
//         });
//       }

//       enrichedResults.push({
//         ...result,
//         violations: enrichedViolations,
//       });
//     } else {
//       enrichedResults.push(result);
//     }
//   }

//   return {
//     reportGeneratedAt: new Date(),
//     tests: enrichedResults,
//     summary: {
//       passed: enrichedResults.filter((r) => r.status === "PASS").length,
//       failed: enrichedResults.filter((r) => r.status === "FAIL").length,
//       total: enrichedResults.length,
//     },
//   };
// };

const Test = require("../models/testModel");
const Requirement = require("../models/requirementModel");
const Rule = require("../models/ruleModel");
const Regulation = require("../models/regulationModel");

exports.buildReport = async (results, options = {}) => {
  const enrichedTests = [];
  const flatViolations = [];

  for (const result of results) {
    const testMeta = { testId: result.testId, testName: result.testName };
    const testBlock = { ...testMeta, status: result.status, details: result.details || {} };

    // --- ERROR tests: operational issue, no legal mapping ---
    if (result.status === "ERROR") {
      enrichedTests.push({ ...testBlock, error: result.details?.reason || "Unknown error" });
      flatViolations.push({
        requirement: "Test execution failed",
        related_rules: [],
        regulations: [],
        suggested_fix:
          "Verify domain reachability and external tool availability. Some sites block scanners (WAF/CDN)."
      });
      continue;
    }

    // --- PASS tests: no violations to add ---
    if (result.status === "PASS") {
      enrichedTests.push(testBlock);
      continue;
    }

    // --- FAIL tests: enrich from DB with seed data ---
    let testDoc = null;
    if (result.testId) {
      testDoc = await Test.findById(result.testId);
    } else if (result.testName) {
      testDoc = await Test.findOne({ name: result.testName });
    }

    enrichedTests.push(testBlock);
    if (!testDoc) continue;

    // Prefer Test.requirement_ids; fallback to Requirement.test_ids
    let requirements = [];
    if (Array.isArray(testDoc.requirement_ids) && testDoc.requirement_ids.length) {
      requirements = await Requirement.find({ _id: { $in: testDoc.requirement_ids } });
    } else {
      requirements = await Requirement.find({ test_ids: testDoc._id });
    }
    if (!requirements.length) continue;

    // Batch fetch all rules & regulations for efficiency
    const allRuleIds = Array.from(
      new Set(requirements.flatMap(r => Array.isArray(r.rule_ids) ? r.rule_ids : []))
    );
    const rules = allRuleIds.length
      ? await Rule.find({ _id: { $in: allRuleIds } })
      : [];
    const ruleMap = new Map(rules.map(r => [r._id, r]));

    const allRegIds = Array.from(new Set(rules.map(r => r.regulation_id).filter(Boolean)));
    const regs = allRegIds.length
      ? await Regulation.find({ _id: { $in: allRegIds } })
      : [];
    const regMap = new Map(regs.map(r => [r._id, r]));

    // Build violation rows for this test
    for (const req of requirements) {
      const related_rules = [];
      const regsSet = new Set();

      for (const ruleId of (req.rule_ids || [])) {
        const rule = ruleMap.get(ruleId);
        if (!rule) continue;

        const reg = regMap.get(rule.regulation_id);
        const regulationName = reg?.name || "Unknown";
        if (regulationName && regulationName !== "Unknown") regsSet.add(regulationName);

        related_rules.push({
          regulation: regulationName,
          article: rule.article_number,
          title: rule.title
        });
      }

      flatViolations.push({
        // 👇 exactly what your table needs
        requirement: req.description,
        related_rules,
        regulations: Array.from(regsSet),
        suggested_fix: req.fix_suggestion || ""
      });
    }
  }

  return {
    reportGeneratedAt: new Date(),
    url: options.url || undefined,
    summary: {
      passed: enrichedTests.filter(t => t.status === "PASS").length,
      failed: enrichedTests.filter(t => t.status === "FAIL").length,
      errors: enrichedTests.filter(t => t.status === "ERROR").length,
      total: enrichedTests.length
    },
    // 👇 your UI should read directly from here
    violations: flatViolations,
    // keep per-test blocks for drill‑down
    tests: enrichedTests
  };
};