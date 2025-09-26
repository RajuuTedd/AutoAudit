const { v4: uuid } = require("uuid");
const { run, runFileMany } = require("../graph/neo4j/neo4j");

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

function normalizeTarget(input) {
  if (!input) return null;
  let t = String(input).trim().replace(/^['"]|['"]$/g, "");
  if (!/^https?:\/\//i.test(t)) t = `https://${t}`;
  try { new URL(t); return t; } catch { return null; }
}

async function runScan(targetUrl) {
  const target = normalizeTarget(targetUrl);
  if (!target) throw new Error("Invalid target URL");

  const scanId = uuid();

  await run(
    `MERGE (s:Scan {id: $scanId})
           ON CREATE SET s.createdAt = datetime(), s.target = $target
           ON MATCH  SET s.target = $target`,
    { scanId, target }
  );

  const axeResults = await axeService.runScan(target);
  const sslResults = await sslLabsService.runScan(target);
  const headerResults = await curlHeaderService.fetchHeaders(target);
  const policyResults = await policyParserService.runScan(target);
  const niktoResults = await niktoService.runScan(target);

  await ingestAxe(scanId, axeResults);
  await ingestSSL(scanId, sslResults);
  await ingestHeaders(scanId, headerResults, target); // pass fallback target here
  await ingestCookies(scanId, policyResults);
  await ingestNikto(scanId, niktoResults);

  const mappingDir = path.join(__dirname, "../cypher/mapping");
  const files = fs.readdirSync(mappingDir).filter(f => f.endsWith('.cypher'));

  for (const file of files) {
    await runFileMany(path.join(mappingDir, file), { scanId });
  }

  return { scanId };
}

module.exports = { runScan };
