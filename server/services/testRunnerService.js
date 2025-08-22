// const sslLabsService = require("./sslLabsService");
// const sslLabsParser = require("../parsers/sslLabsParser");

// exports.runAllTests = async (url) => {
//   const results = [];

//   // SSL Labs (example)
//   try {
//     const sslRaw = await sslLabsService.runScan(url);  // external tool/API/CLI
//     const sslResult = sslLabsParser.parse(sslRaw);     // normalize
//     results.push(sslResult);
//   } catch (e) {
//     results.push({
//       testName: "SSL Labs Scan",
//       status: "ERROR",
//       details: { reason: e.message || "Unknown error" },
//       violations: []
//     });
//   }

//   return results;
// };

const Test = require("../models/testModel");
const sslLabsService = require("./sslLabsService");
const sslLabsParser  = require("../parsers/sslLabsParser");

/**
 * Attach DB test metadata (id + name) to a normalized result,
 * by matching the seed's `tool` or `command` (no hardcoded names).
 */
async function attachTestMeta(result, { toolLike, commandRegex }) {
  let testDoc = null;

  if (toolLike) {
    testDoc = await Test.findOne({ tool: { $regex: toolLike, $options: "i" } });
  }
  if (!testDoc && commandRegex) {
    testDoc = await Test.findOne({ command: { $regex: commandRegex, $options: "i" } });
  }

  if (testDoc) {
    return { ...result, testId: testDoc._id, testName: testDoc.name };
  }
  return result; // builder will skip enrichment if still unknown
}

exports.runAllTests = async (url) => {
  const results = [];

  // ---- SSL Labs ----
  try {
    const sslRaw    = await sslLabsService.runScan(url);
    let   sslResult = sslLabsParser.parse(sslRaw);

    // Try to resolve the Test from seeds using tool/command (no hardcoded text)
    sslResult = await attachTestMeta(sslResult, {
      toolLike: "ssl",                                      // matches tool: "SSL Labs", "ssl", etc.
      commandRegex: /ssllabs\.com\/api\/v3\/analyze/i       // matches your seed command string
    });

    results.push(sslResult);
  } catch (e) {
    results.push({
      status: "ERROR",
      details: { reason: e.message || "Unknown error" }
    });
  }

  return results;
};
