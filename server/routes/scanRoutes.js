// server/routes/scanRoutes.js
const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController"); // ← ScanController

// GET /api/scan?url=example.com
router.get("/scan", scanController.runScan);

module.exports = router;
