const Test = require("../models/testModel");
const sslLabsService = require("./sslLabsService");
const sslLabsParser = require("../parsers/sslLabsParser");
const axeService = require("./axeService");
const axeParser = require("../parsers/axeParser");
const niktoService = require("./niktoService");
const niktoParser = require("../parsers/niktoParser");
const curlHeaderService = require("./curlHeaderService");
const curlHeaderParser = require("../parsers/curlHeaderParser");
const policyParserService = require("./policyParserService");
const policyParser = require("../parsers/policyParser");

// Map curl header check "type" to a unique command regex for seed matching
const CURL_TYPE_TO_REGEX = {
  csp: /content-security-policy/i,
  xfo: /x-frame-options/i,
  xcto: /x-content-type-options/i,
  referrer: /referrer-policy/i,
};

/**
 * Attach DB test metadata (id + name) to a normalized result,
 * by matching the seed's tool or command (no hardcoded names).
 */
async function attachTestMeta(result, { toolLike, commandRegex }) {
  let testDoc = null;

  if (commandRegex) {
    const cmdQuery =
      commandRegex instanceof RegExp
        ? { command: commandRegex }
        : { command: { $regex: commandRegex, $options: "i" } };
    testDoc = await Test.findOne(cmdQuery);
  }

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
  return result; // leave untouched if not found
}

exports.runAllTests = async (url) => {
  const results = [];

  // --- SSL Labs ---
  try {
    const sslRaw = await sslLabsService.runScan(url);
    let sslResult = sslLabsParser.parse(sslRaw);
    sslResult = await attachTestMeta(sslResult, {
      toolLike: "ssl",
      commandRegex: /ssllabs\.com\/api\/v3\/analyze/i,
    });
    results.push(sslResult);
  } catch (e) {
    results.push({
      testName: "SSL/TLS Check",
      status: "ERROR",
      details: { reason: e.message || "SSL scan failed" },
    });
  }

  // --- Axe CLI ---
  try {
    const axeRaw = await axeService.runScan(url);
    let axeResult = axeParser.parse(axeRaw);
    axeResult = await attachTestMeta(axeResult, {
      toolLike: "axe",
      commandRegex: /@axe-core\/cli/i,
    });
    results.push(axeResult);
  } catch (e) {
    results.push({
      testName: "Accessibility (axe)",
      status: "ERROR",
      details: { reason: e.message || "axe scan failed" },
    });
  }

  // --- Nikto ---
  try {
    const niktoRaw = await niktoService.runScan(url);
    let niktoResult = niktoParser.parse(niktoRaw);
    niktoResult = await attachTestMeta(niktoResult, {
      toolLike: "nikto",
      commandRegex: /nikto/i,
    });
    results.push(niktoResult);
  } catch (e) {
    results.push({
      testName: "Nikto Scan",
      status: "ERROR",
      details: { reason: e.message || "nikto scan failed" },
    });
  }

  // --- Curl Header Checks ---
  try {
    const headersData = await curlHeaderService.fetchHeaders(url);
    for (const type of ["csp", "xfo", "xcto", "referrer"]) {
      try {
        let curlResult = curlHeaderParser.parse({ type, data: headersData });
        curlResult = await attachTestMeta(curlResult, {
          commandRegex: CURL_TYPE_TO_REGEX[type] || /curl/i,
        });
        results.push(curlResult);
      } catch (e) {
        results.push({
          testName: `Header check: ${type}`,
          status: "ERROR",
          details: { reason: e.message || `curl ${type} check failed` },
        });
      }
    }
  } catch (e) {
    results.push({
      testName: "Header fetch (curl)",
      status: "ERROR",
      details: { reason: e.message || "curl header fetch failed" },
    });
  }

  // --- Puppeteer + Gemini Policy Checks ---
  try {
    const raw = await policyParserService.runScan(url);
    let policyResult = policyParser.parse(raw);
    policyResult = await attachTestMeta(policyResult, {
      toolLike: "puppeteer",
      commandRegex: /privacy|cookie/i,
    });
    results.push(policyResult);
  } catch (e) {
    results.push({
      testName: "Privacy Policy Detection",
      status: "ERROR",
      details: { reason: e.message || "policy scan failed" },
    });
  }

  return results;
};
