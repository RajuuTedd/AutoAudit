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
  let t = String(input)
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (!/^https?:\/\//i.test(t)) t = `https://${t}`;
  try {
    new URL(t);
    return t;
  } catch {
    return null;
  }
}

async function runScan(targetUrl) {
  const target = normalizeTarget(targetUrl);
  if (!target) throw new Error("Invalid target URL");

  // Generate a consistent ID based on the URL to prevent duplicate website nodes
  const scanId = Buffer.from(target).toString("base64");

  // 1. Check if a recent scan exists (e.g., within the last 1 hour)
  const existing = await run(
    `MATCH (s:Scan {id: $scanId}) 
     WHERE s.createdAt > datetime() - duration('PT1H') 
     RETURN s.id AS id`,
    { scanId },
  );

  if (existing.records.length > 0) {
    return { scanId, cached: true }; // Return early to save time and DB space
  }

  // 2. Create or Update the Scan node
  // This is required so the rest of the pipeline has a node to attach findings to
  await run(
    `MERGE (s:Scan {id: $scanId})
     ON CREATE SET s.createdAt = datetime(), s.target = $target
     ON MATCH  SET s.target = $target, s.updatedAt = datetime()`,
    { scanId, target },
  );

  // 3. Clear old findings for this specific website before re-scanning
  // This keeps the knowledge graph from growing infinitely with redundant data
  await run(
    `MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding) 
     OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(e:Evidence)
     DETACH DELETE f, e`,
    { scanId },
  );

  // 4. Run external tools
  const results = {};

  const runTool = async (name, serviceCall) => {
    try {
      console.log(`🚀 Starting ${name}...`);
      return await serviceCall;
    } catch (err) {
      console.error(`❌ Tool ${name} failed:`, err.message);
      return null; // Return null so ingestors can skip it
    }
  };

  const axeResults = await axeService.runScan(target);
  const sslResults = await sslLabsService.runScan(target);
  const headerResults = await curlHeaderService.fetchHeaders(target);
  const policyResults = await policyParserService.runScan(target);
  const niktoResults = await niktoService.runScan(target);

  // 5. Ingest new findings
  await ingestAxe(scanId, axeResults);
  await ingestSSL(scanId, sslResults);
  await ingestHeaders(scanId, headerResults, target);
  await ingestCookies(scanId, policyResults);
  await ingestNikto(scanId, niktoResults);

  // 6. Run mapping logic
  const mappingDir = path.join(__dirname, "../cypher/mapping");
  const files = fs.readdirSync(mappingDir).filter((f) => f.endsWith(".cypher"));

  for (const file of files) {
    await runFileMany(path.join(mappingDir, file), { scanId });
  }

  return { scanId, cached: false };
}

module.exports = { runScan };
