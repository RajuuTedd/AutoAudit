const { run } = require("../neo4j/neo4j.js");

function coerceAxeResults(input) {
  if (!input) return null;
  if (typeof input === "string") {
    try { return JSON.parse(input); } catch (_) { return null; }
  }
  return input;
}

function extractViolations(axe) {
  if (!axe) return [];
  if (Array.isArray(axe.violations)) return axe.violations;
  if (axe.results && Array.isArray(axe.results.violations)) return axe.results.violations;
  return [];
}

function mapImpact(impact) {
  // axe: minor | moderate | serious | critical → leave as-is, default moderate
  return impact || "moderate";
}

/**
 * Ingest axe-core results into Neo4j as Findings + Evidence.
 * @param {string} scanId
 * @param {object|string} axeResults - object or JSON string from axe
 */
async function ingestAxe(scanId, axeResults) {
  const axe = coerceAxeResults(axeResults);
  const violations = extractViolations(axe);

  if (!Array.isArray(violations)) {
    console.warn("ingestAxe: axeResults.violations not an array", { type: typeof violations });
    return; // avoid throwing — just skip
  }
  if (violations.length === 0) {
    // nothing to ingest; not an error
    return;
  }

  for (const violation of violations) {
    const nodes = Array.isArray(violation.nodes) ? violation.nodes : [];
    for (const node of nodes) {
      const selector = Array.isArray(node.target) ? node.target.join(",") : String(node.target || "");
      const findingId = `axe:${violation.id}:${selector}`;

      await run(
        `
        MERGE (s:Scan {id: $scanId})
        MERGE (f:Finding {id: $findingId})
          ON CREATE SET f.tool = 'axe', f.title = $title, f.severity = $severity, f.createdAt = timestamp()
          ON MATCH  SET f.tool = 'axe', f.title = $title, f.severity = $severity
        MERGE (s)-[:FOUND]->(f)
        MERGE (t:Test {id: $testId})
        MERGE (f)-[:DETECTED_BY]->(t)
        WITH f
        UNWIND $evidence AS ev
          CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {id: apoc.create.uuid(), key: ev.key, value: ev.value})
        `,
        {
          scanId,
          findingId,
          title: violation.help || violation.description || violation.id,
          severity: mapImpact(violation.impact),
          testId: violation.id, // assumes your seeds use axe rule ids as Test ids
          evidence: [
            { key: "axerule", value: violation.id },
            { key: "selector", value: selector },
            ...(node.html ? [{ key: "html", value: String(node.html) }] : []),
          ],
        }
      );
    }
  }
}

module.exports = ingestAxe;
