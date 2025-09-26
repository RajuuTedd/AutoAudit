// server/routes/scanRoutes.js
const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController"); // ← ScanController

// // GET /api/scan?url=example.com
// old pre-neo4j
// router.get("/scan", scanController.runScan);
// console.log("scan route hit");
// router.get("/scan/:scanId/report", scanController.getReport);

router.post("/scan", scanController.startScan);

// GET report for a scan
router.get("/scan/:scanId/report", scanController.getReport);

module.exports = router;
