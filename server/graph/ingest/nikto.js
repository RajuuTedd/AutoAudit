const { runCypher } = require("../neo4j/neo4j");

async function ingestNikto(scanId, niktoResults) {
  for (const issue of niktoResults.issues || []) {
    const findingId = `nikto:${issue.id}`;

    await runCypher(
      `
      MERGE (s:Scan {id: $scanId})
      CREATE (f:Finding {
        id: $findingId,
        tool: "nikto",
        title: $title,
        severity: $severity
      })
      MERGE (s)-[:FOUND]->(f)
      MERGE (t:Test {id: "nikto"})
      MERGE (f)-[:DETECTED_BY]->(t)
      WITH f
      UNWIND $evidence AS ev
        CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
      `,
      {
        scanId,
        findingId,
        title: issue.msg,
        severity: issue.severity || "medium",
        evidence: [
          { key: "finding_code", value: issue.id },
          { key: "path", value: issue.path || "" },
        ],
      }
    );
  }
}

module.exports = ingestNikto;
