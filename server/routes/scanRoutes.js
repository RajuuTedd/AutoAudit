// const express = require("express");
// const router = express.Router();
// const { scanSSL } = require("../controllers/scanController");

// router.get("/scan-ssl", scanSSL);
// module.exports = router;
// this is the previous code below is the new code according to the new structure
const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");

router.get("/scan", scanController.runScan);

module.exports = router;
