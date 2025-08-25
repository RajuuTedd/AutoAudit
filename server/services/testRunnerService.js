const Test = require("../models/testModel");

const sslLabsService = require("./sslLabsService");
const sslLabsParser  = require("../parsers/sslLabsParser");

const axeService = require("./axeService");
const axeParser  = require("../parsers/axeParser");

const niktoService = require("./niktoService");
const niktoParser  = require("../parsers/niktoParser");

const curlHeaderService = require("./curlHeaderService");
const curlHeaderParser  = require("../parsers/curlHeaderParser");

// Map curl header check "type" to a unique command regex for seed matching
const CURL_TYPE_TO_REGEX = {
  csp: /content-security-policy/i,
  xfo: /x-frame-options/i,
  xcto: /x-content-type-options/i,
  referrer: /referrer-policy/i
};

/**
 * Attach DB test metadata (id + name) to a normalized result,
 * by matching the seed's `tool` or `command` (no hardcoded names).
 */
async function attachTestMeta(result, { toolLike, commandRegex }) {
  let testDoc = null;

  // Prefer matching by commandRegex first (more specific)
  if (commandRegex) {
    // If a real RegExp is provided, don't also pass $options (Mongo error: "options set in both $regex and $options")
    const cmdQuery =
      commandRegex instanceof RegExp
        ? { command: commandRegex }
        : { command: { $regex: commandRegex, $options: "i" } };

    testDoc = await Test.findOne(cmdQuery);
  }

  // Fallback to matching by tool name
  if (!testDoc && toolLike) {
    const toolQuery =
      toolLike instanceof RegExp
        ? { tool: toolLike }
        : { tool: { $regex: toolLike, $options: "i" } };

    testDoc = await Test.findOne(toolQuery);
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

  // --- Curl Header Checks ---
  try {
    // Fetch headers once; reuse for each logical check
    const headersData = await curlHeaderService.fetchHeaders(url);

    for (const type of ["csp", "xfo", "xcto", "referrer"]) {
      try {
        let curlResult = curlHeaderParser.parse({ type, data: headersData });
        // Attach the correct seed test by header type (no generic toolLike to avoid collisions)
        curlResult = await attachTestMeta(curlResult, {
          commandRegex: CURL_TYPE_TO_REGEX[type] || /curl/i
        });
        results.push(curlResult);
      } catch (e) {
        results.push({
          status: "ERROR",
          details: { reason: e.message || `curl ${type} check failed` }
        });
      }
    }
  } catch (e) {
    // If fetching headers itself fails, record a single failure for visibility
    results.push({
      status: "ERROR",
      details: { reason: e.message || "curl header fetch failed" }
    });
  }

  return results;
};
