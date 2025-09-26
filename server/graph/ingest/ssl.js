// server/graph/ingest/ssl.js
const { run } = require("../neo4j/neo4j");

function protocolsToString(protocols) {
  if (!Array.isArray(protocols)) return "";
  return protocols
    .map(p => {
      const name = (p?.name || "").trim();
      const ver = (p?.version || "").trim();
      return [name, ver].filter(Boolean).join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

async function ingestSSL(scanId, sslResults = {}) {
  const endpoints = Array.isArray(sslResults.endpoints) ? sslResults.endpoints : [];
  if (endpoints.length === 0) return; // nothing to ingest

  for (const endpoint of endpoints) {
    const ip = endpoint.ipAddress || endpoint.ip || endpoint.host;
    if (!ip) continue; // skip malformed endpoint

    const findingId = `ssl:${ip}`;
    const protoStr = protocolsToString(endpoint.details?.protocols);
    const hasProtocols = protoStr.length > 0;

    const hsts = endpoint.details?.hstsPolicy || {};
    const hsts_present = (
      String(hsts.status || "").toLowerCase() === "present" ||
      (typeof hsts.maxAge === "number" && hsts.maxAge > 0)
    )
      ? "true"
      : "false";

    const grade = endpoint.grade || sslResults.grade || "N/A";
    const encBits = endpoint.details?.keyStrength || endpoint.details?.key?.size;

    const evidence = [
      { key: "host", value: String(ip) },
      { key: "grade", value: String(grade) },
      { key: "protocols", value: protoStr || "unknown" },
      { key: "hsts_present", value: hsts_present },
      { key: "https_supported", value: String(hasProtocols) },
    ];
    if (encBits != null) evidence.push({ key: "encryption_strength", value: String(encBits) });

    await run(
      `
      MERGE (s:Scan {id: $scanId})
      MERGE (f:Finding {id: $findingId})
        ON CREATE SET f.tool = 'ssl', f.title = 'SSL/TLS configuration', f.severity = 'info', f.createdAt = timestamp()
        ON MATCH  SET f.tool = 'ssl', f.title = 'SSL/TLS configuration', f.severity = 'info'
      MERGE (s)-[:FOUND]->(f)
      MERGE (t:Test {id: 'ssl-labs'}) // ensure a stable Test node
      MERGE (f)-[:DETECTED_BY]->(t)
      WITH f
      UNWIND $evidence AS ev
        CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
      `,
      { scanId, findingId, evidence }
    );
  }
}

module.exports = ingestSSL;
