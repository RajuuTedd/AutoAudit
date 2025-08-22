// const express = require("express");
// const router = express.Router();
// const { scanSSL } = require("../controllers/scanController");

// router.get("/scan-ssl", scanSSL);
// module.exports = router;
// this is the previous code below is the new code according to the new structure
// const express = require("express");
// const router = express.Router();
// const scanController = require("../controllers/scanController");

// router.get("/scan", scanController.runScan);

// module.exports = router;
const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController"); // ← ScanController

// GET /api/scan?url=example.com
router.get("/scan", scanController.runScan);

module.exports = router;

// const testRunnerService = require("../services/testRunnerService");
// const reportBuilderService = require("../services/reportBuilderService");

// @route   GET /api/scan/ssl?url=example.com
// @desc    Run SSL scan for the given URL
// @access  Public
// router.get("/scan", async (req, res) => {
//   try {
//     const { url } = req.query;
//     if (!url) {
//       return res.status(400).json({ error: "URL is required" });
//     }

//     // Run SSL test (via testRunnerService)
//     const results = await testRunnerService.runAllTests(url);

//     // Build final report
//     const report = await reportBuilderService.buildReport(results);

//     res.json(report);
//   } catch (err) {
//     console.error("❌ Scan Error:", err.message);
//     res.status(500).json({ error: err.message || "Test execution failed" });
//   }
// });
