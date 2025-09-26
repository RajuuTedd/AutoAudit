const { v4: uuid } = require("uuid");
const { runCypher } = require("../graph/neo4j/neo4j.js");

const axeService = require("./axeService");
const sslLabsService = require("./sslLabsService");
const curlHeaderService = require("./curlHeaderService");
const policyParserService = require("./policyParserService");
const niktoService = require("./niktoService");

const ingestAxe = require("../graph/ingest/axe");
const ingestSSL = require("../graph/ingest/ssl");
const ingestHeaders = require("../graph/ingest/headers");
const ingestCookies = require("../graph/ingest/cookies");
const ingestNikto = require("../graph/ingest/nikto");

const fs = require("fs");
const path = require("path");

async function runScan(targetUrl) {
  const scanId = uuid();

  await runCypher(
    `CREATE (:Scan {id: $scanId, target: $targetUrl, createdAt: datetime()})`,
    { scanId, targetUrl }
  );

  const axeResults = await axeService.runScan(targetUrl);
  const sslResults = await sslLabsService.runScan(targetUrl);
  const headerResults = await curlHeaderService.fetchHeaders(targetUrl);
  const policyResults = await policyParserService.runScan(targetUrl);
  const niktoResults = await niktoService.runScan(targetUrl);

  await ingestAxe(scanId, axeResults);
  await ingestSSL(scanId, sslResults);
  await ingestHeaders(scanId, headerResults);
  await ingestCookies(scanId, policyResults);
  await ingestNikto(scanId, niktoResults);

  const mappingDir = path.join(__dirname, "../cypher/mapping");
  const files = fs.readdirSync(mappingDir);

  for (const file of files) {
    const query = fs.readFileSync(path.join(mappingDir, file), "utf8");
    await runCypher(query, { scanId });
  }

  return { scanId };
}

module.exports = { runScan };
