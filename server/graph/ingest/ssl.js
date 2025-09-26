const { runCypher } = require("../neo4j/neo4j");

async function ingestSSL(scanId, sslResults) {
  for (const endpoint of sslResults.endpoints || []) {
    const findingId = `ssl:${endpoint.ipAddress}`;

    await runCypher(
      `
      MERGE (s:Scan {id: $scanId})
      CREATE (f:Finding {
        id: $findingId,
        tool: "ssl",
        title: "SSL/TLS configuration",
        severity: "info"
      })
      MERGE (s)-[:FOUND]->(f)
      MERGE (t:Test {id: "ssl-labs"}) // static test id
      MERGE (f)-[:DETECTED_BY]->(t)
      WITH f
      UNWIND $evidence AS ev
        CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
      `,
      {
        scanId,
        findingId,
        evidence: [
          { key: "ip", value: endpoint.ipAddress },
          { key: "grade", value: endpoint.grade || "N/A" },
          {
            key: "protocols",
            value: JSON.stringify(endpoint.details?.protocols || []),
          },
          {
            key: "hsts_present",
            value: endpoint.details?.hstsPolicy?.status || "unknown",
          },
        ],
      }
    );
  }
}

module.exports = ingestSSL;
