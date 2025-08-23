const Test = require("../models/testModel");

const sslLabsService = require("./sslLabsService");
const sslLabsParser  = require("../parsers/sslLabsParser");

const axeService = require("./axeService");
const axeParser  = require("../parsers/axeParser");

const niktoService = require("./niktoService");
const niktoParser  = require("../parsers/niktoParser");

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

  // ---- Axe CLI ----
  try {
    const axeRaw    = await axeService.runScan(url);
    let   axeResult = axeParser.parse(axeRaw);
    axeResult = await attachTestMeta(axeResult, {
      toolLike: "axe",                                  // matches "axe", "axe-core"
      commandRegex: /@axe-core\/cli/i
    });
    results.push(axeResult);
  } catch (e) {
    results.push({ status: "ERROR", details: { reason: e.message || "Unknown error" } });
  }

  // --- Nikto ---
  try {
    const niktoRaw = await niktoService.runScan(url);
    let niktoResult = niktoParser.parse(niktoRaw);
    niktoResult = await attachTestMeta(niktoResult, {
      toolLike: "nikto",
      commandRegex: /nikto/i
    });
    results.push(niktoResult);
  } catch (e) {
    results.push({ status: "ERROR", details: { reason: e.message } });
  }

  return results;
};
