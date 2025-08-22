// const Test = require("../models/testModel");
// const Requirement = require("../models/requirementModel");
// const Rule = require("../models/ruleModel");
// const Regulation = require("../models/regulationModel");
// const axios = require("axios");

// // Polling helper
// async function waitForSSLAnalysis(host) {
//   let retries = 0;
//   const maxRetries = 10;
//   const delay = (ms) => new Promise((res) => setTimeout(res, ms));

//   while (retries < maxRetries) {
//     console.log(`🔁 Polling SSL Labs... Attempt ${retries + 1}`);
//     const response = await axios.get(
//       `https://api.ssllabs.com/api/v3/analyze?host=${host}&all=done`
//     );
//     const data = response.data;

//     if (data.status === "READY") {
//       console.log("✅ Scan ready!");
//       return data;
//     }

//     if (data.status === "ERROR") {
//       console.log("❌ Scan error");
//       throw new Error("SSL Labs scan failed");
//     }

//     await delay(5000);
//     retries++;
//   }

//   throw new Error("SSL Labs scan timed out");
// }

// // Main controller
// exports.scanSSL = async (req, res) => {
//   console.log("🔍 Using updated scanSSL function");
//   const { url } = req.query;
//   if (!url) return res.status(400).json({ error: "URL is required" });

//   try {
//     const host = url.replace(/^https?:\/\//, "");

//     const scanData = await waitForSSLAnalysis(host);

//     const endpoints = scanData.endpoints || [];

//     // ✅ Check if any endpoint has grade A or A+
//     const hasGradeA = endpoints.some(
//       (e) => e.grade === "A" || e.grade === "A+"
//     );

//     if (hasGradeA) {
//       return res.json({
//         status: "PASS",
//         message: "SSL Configuration is secure (Grade A or higher).",
//         gradeDetails: endpoints.map((e) => ({
//           ip: e.ipAddress,
//           grade: e.grade || "No Grade",
//         })),
//       });
//     }

//     // If no A grade, then FAIL and go to DB logic
//     const test = await Test.findOne({ _id: "test-ssl-check" });
//     if (!test) return res.status(404).json({ error: "Test not found" });

//     const requirements = await Requirement.find({ test_ids: test._id });
//     const result = [];

//     for (let req of requirements) {
//       const relatedRules = await Rule.find({ _id: { $in: req.rule_ids } });
//       const ruleDetails = [];

//       for (let rule of relatedRules) {
//         const regulation = await Regulation.findById(rule.regulation_id);
//         ruleDetails.push({
//           regulation: regulation?.name || "Unknown",
//           article: rule.article_number,
//           ruleTitle: rule.title,
//           ruleDesc: rule.description,
//         });
//       }

//       result.push({
//         requirement: req.description,
//         fix: req.fix_suggestion,
//         related_rules: ruleDetails,
//       });
//     }

//     return res.json({
//       status: "FAIL",
//       failedTest: test.name,
//       affectedRequirements: result,
//       endpointGrades: endpoints.map((e) => ({
//         ip: e.ipAddress,
//         grade: e.grade || "No Grade",
//       })),
//     });
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//     return res
//       .status(500)
//       .json({ error: err.message || "Test execution failed" });
//   }
// };
// scanController is now refacotored it is now in sslLabsParser, testRunnerService and ssLabsService
const testRunnerService = require("../services/testRunnerService");
const reportBuilderService = require("../services/reportBuilderService");

exports.runScan = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // Run all tests (SSL Labs now, more later)
    const results = await testRunnerService.runAllTests(url);

    // Build final report with DB enrichment
    const report = await reportBuilderService.buildReport(results);

    res.json(report);
  } catch (err) {
    console.error("❌ Scan Error:", err.message);
    res.status(500).json({ error: err.message || "Test execution failed" });
  }
};
