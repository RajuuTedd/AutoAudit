const { runCypher } = require("../neo4j/neo4j");

async function ingestCookies(scanId, cookieResults) {
  for (const cookie of cookieResults.cookies || []) {
    const findingId = `cookie:${cookie.name}`;

    await runCypher(
      `
      MERGE (s:Scan {id: $scanId})
      CREATE (f:Finding {
        id: $findingId,
        tool: "cookies",
        title: "Cookie check",
        severity: "info"
      })
      MERGE (s)-[:FOUND]->(f)
      MERGE (t:Test {id: "cookies"})
      MERGE (f)-[:DETECTED_BY]->(t)
      WITH f
      UNWIND $evidence AS ev
        CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
      `,
      {
        scanId,
        findingId,
        evidence: [
          { key: "cookie_name", value: cookie.name },
          { key: "cookie_category", value: cookie.category || "unknown" },
          { key: "set_before_consent", value: cookie.setBeforeConsent },
          { key: "secure_flag", value: cookie.secure },
          { key: "httponly_flag", value: cookie.httpOnly },
        ],
      }
    );
  }
}

module.exports = ingestCookies;
