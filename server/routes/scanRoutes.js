const express = require("express");
const router = express.Router();
const { scanSSL } = require("../controllers/scanController");

router.get("/scan-ssl", scanSSL);
module.exports = router;
