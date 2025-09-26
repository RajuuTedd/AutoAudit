const { runCypher } = require("../neo4j/neo4j");

async function ingestHeaders(scanId, headerResults) {
  const findingId = `headers:${headerResults.url}`;

  await runCypher(
    `
    MERGE (s:Scan {id: $scanId})
    CREATE (f:Finding {
      id: $findingId,
      tool: "headers",
      title: "Security Headers",
      severity: "info"
    })
    MERGE (s)-[:FOUND]->(f)
    MERGE (t:Test {id: "curl-headers"})
    MERGE (f)-[:DETECTED_BY]->(t)
    WITH f
    UNWIND $evidence AS ev
      CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
    `,
    {
      scanId,
      findingId,
      evidence: [
        {
          key: "csp_present",
          value: !!headerResults.headers["content-security-policy"],
        },
        {
          key: "xfo_value",
          value: headerResults.headers["x-frame-options"] || "missing",
        },
        {
          key: "xcto_value",
          value: headerResults.headers["x-content-type-options"] || "missing",
        },
        {
          key: "referrer_policy_value",
          value: headerResults.headers["referrer-policy"] || "missing",
        },
      ],
    }
  );
}

module.exports = ingestHeaders;
