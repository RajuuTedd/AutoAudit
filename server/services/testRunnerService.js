const sslLabsService = require("./sslLabsService");
const sslLabsParser = require("../parsers/sslLabsParser");

exports.runAllTests = async (url) => {
  const results = [];

  // SSL Labs (example)
  try {
    const sslRaw = await sslLabsService.runScan(url);  // external tool/API/CLI
    const sslResult = sslLabsParser.parse(sslRaw);     // normalize
    results.push(sslResult);
  } catch (e) {
    results.push({
      testName: "SSL Labs Scan",
      status: "ERROR",
      details: { reason: e.message || "Unknown error" },
      violations: []
    });
  }

  return results;
};
