const { runCypher } = require("../neo4j/neo4j");

const { v4: uuid } = require("uuid");

async function ingestAxe(scanId, axeResults) {
  for (const violation of axeResults.violations) {
    for (const node of violation.nodes) {
      const findingId = `axe:${violation.id}:${node.target.join(",")}`;

      await runCypher(
        `
        MERGE (s:Scan {id: $scanId})
        CREATE (f:Finding {
          id: $findingId,
          tool: "axe",
          title: $title,
          severity: $severity
        })
        MERGE (s)-[:FOUND]->(f)
        MERGE (t:Test {id: $testId})
        MERGE (f)-[:DETECTED_BY]->(t)
        WITH f
        UNWIND $evidence AS ev
          CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
        `,
        {
          scanId,
          findingId,
          title: violation.help,
          severity: violation.impact || "moderate",
          testId: violation.id, // link to seed test
          evidence: [
            { key: "axerule", value: violation.id },
            { key: "selector", value: node.target.join(",") },
            { key: "html", value: node.html },
          ],
        }
      );
    }
  }
}

module.exports = ingestAxe;
