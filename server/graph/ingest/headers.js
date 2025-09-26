const { run } = require("../neo4j/neo4j");

function normalizeTarget(input) {
  if (!input) return null;
  let t = String(input).trim().replace(/^['"]|['"]$/g, "");
  if (/^https?:\/\//i.test(t)) {
    try { const u = new URL(t); return u.origin; } catch { return null; }
  }
  // If it's a host, coerce to https URL and return origin
  try { const u = new URL(`https://${t}`); return u.origin; } catch { return null; }
}

function pickTargetOrigin(payload) {
  const candidates = [
    payload.url,
    payload.finalUrl,
    payload.requestUrl,
    payload.origin,
    payload.host,
    payload.target,
    payload.request && (payload.request.url || payload.request.host),
    payload.headers && (payload.headers.host || payload.headers.Host)
  ].filter(Boolean);
  for (const c of candidates) {
    const o = normalizeTarget(c);
    if (o) return o;
  }
  return null;
}

async function ingestHeaders(scanId, headerResults = {}, fallbackTarget) {
  const headers = headerResults.headers || headerResults || {};
  // Normalize header keys to lowercase
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [String(k).toLowerCase(), v]));

  const targetOrigin = pickTargetOrigin(headerResults) || normalizeTarget(fallbackTarget);
  if (!targetOrigin) {
    throw new Error("ingestHeaders: missing or invalid url/host in headerResults");
  }

  const findingId = `headers:${targetOrigin}`;

  const csp = lower["content-security-policy"];
  const xfo = lower["x-frame-options"];
  const xcto = lower["x-content-type-options"];
  const refpol = lower["referrer-policy"];

  await run(
    `
    MERGE (s:Scan {id: $scanId})
    MERGE (f:Finding {id: $findingId})
      ON CREATE SET f.tool = 'headers', f.title = 'Security Headers', f.severity = 'info', f.createdAt = timestamp()
      ON MATCH  SET f.tool = 'headers', f.title = 'Security Headers', f.severity = 'info'
    MERGE (s)-[:FOUND]->(f)
    MERGE (t:Test {id: 'curl-headers'})
    MERGE (f)-[:DETECTED_BY]->(t)
    WITH f
    UNWIND $evidence AS ev
      CREATE (f)-[:HAS_EVIDENCE]->(:Evidence {key: ev.key, value: ev.value})
    `,
    {
      scanId,
      findingId,
      evidence: [
        { key: 'csp_present', value: String(Boolean(csp)) },
        { key: 'xfo_value', value: xfo ? String(xfo) : 'missing' },
        { key: 'xcto_value', value: xcto ? String(xcto) : 'missing' },
        { key: 'referrer_policy_value', value: refpol ? String(refpol) : 'missing' },
        { key: 'host', value: targetOrigin },
      ],
    }
  );
}

module.exports = ingestHeaders;
