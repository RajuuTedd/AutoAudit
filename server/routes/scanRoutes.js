// server/routes/scanRoutes.js
const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");

// Single endpoint: run a scan and return the report (KG path)
router.post("/scan", scanController.startScan);

module.exports = router;
