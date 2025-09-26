// server/services/reportKG.js
const { run } = require("../graph/neo4j/neo4j");
async function buildSummary(scanId) {
  // Fetch URL/target for this scan
  const targetRes = await run(`MATCH (s:Scan {id: $scanId}) RETURN s.target AS url`, { scanId });
  const url = targetRes.records[0]?.get("url") || null;

  // Total tests available (from ontology)
  const totalTestsRes = await run(`MATCH (t:Test) RETURN count(t) AS total`);
  const totalTests = totalTestsRes.records[0]?.get("total")?.toNumber ? totalTestsRes.records[0].get("total").toNumber() : totalTestsRes.records[0]?.get("total") || 0;

  // Total failures for this scan = number of distinct Requirements that have a MATCH from this scan
  const totalFailuresRes = await run(
    `
    MATCH (s:Scan {id: $scanId})-[:FOUND]->(:Finding)-[:MATCHES]->(req:Requirement)
    RETURN count(DISTINCT req) AS fails
    `,
    { scanId }
  );
  const totalFailures = totalFailuresRes.records[0]?.get("fails")?.toNumber ? totalFailuresRes.records[0].get("fails").toNumber() : totalFailuresRes.records[0]?.get("fails") || 0;

  // Regulation breakdown: count distinct failing Requirements per Regulation
  const regRes = await run(
    `
    MATCH (s:Scan {id: $scanId})-[:FOUND]->(:Finding)-[:MATCHES]->(req:Requirement)
          -[:PART_OF]->(r:Rule)-[:UNDER]->(g:Regulation)
    RETURN g.id AS regId, g.name AS name, count(DISTINCT req) AS failures
    `,
    { scanId }
  );
  const regulationBreakdown = {};
  for (const rec of regRes.records) {
    const regId = rec.get("regId");
    const name = rec.get("name");
    const failuresVal = rec.get("failures");
    const failures = failuresVal?.toNumber ? failuresVal.toNumber() : failuresVal || 0;
    if (regId) regulationBreakdown[regId] = { name, failures };
  }

  return {
    scanId,
    url,
    summary: {
      totalTests,
      totalFailures,
      regulationBreakdown,
    },
  };
}

async function buildReport(scanId) {
  // 1) Violations grouped by Requirement with full metadata and all related Rules + Regulation info
  const violationsRes = await run(
    `
    MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding)-[m:MATCHES]->(req:Requirement)
    // Gather evidence per finding
    OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(e:Evidence)
    WITH s, req, f, m, collect({key: e.key, value: e.value}) AS ev
    WITH req,
         collect(DISTINCT {
           findingId: f.id,
           tool: f.tool,
           severity: f.severity,
           reason: m.reason,
           evidence: ev
         }) AS findings
    // Attach ALL rules for this requirement (independent of the scan)
    OPTIONAL MATCH (req)-[:PART_OF]->(r:Rule)-[:UNDER]->(g:Regulation)
    WITH req, findings,
         collect(DISTINCT {
           id: r.id,
           title: r.title,
           article_number: r.article_number,
           description: r.description,
           regulation: { id: g.id, name: g.name }
         }) AS rules
    RETURN {
      requirement: {
        id: req.id,
        name: req.name,
        description: req.description,
        severity_default: req.severity_default,
        fix_suggestion: req.fix_suggestion
      },
      rules: rules,
      findings: findings
    } AS violation
    ORDER BY violation.requirement.id
    `,
    { scanId }
  );

  const violations = violationsRes.records.map(r => r.get("violation"));

  // 2) Requirement Statuses (PASS/FAIL per requirement)
  const reqStatusRes = await run(
    `
    MATCH (req:Requirement)
    OPTIONAL MATCH (s:Scan {id: $scanId})-[:FOUND]->(:Finding)-[:MATCHES]->(req)
    WITH req, count(*) AS failCount
    RETURN req.id AS requirementId, req.name AS requirementName, failCount
    `,
    { scanId }
  );

  const requirementStatuses = reqStatusRes.records.map((r) => {
    const requirementId = r.get("requirementId");
    const requirementName = r.get("requirementName");
    const failCount = r.get("failCount")?.toNumber ? r.get("failCount").toNumber() : r.get("failCount");
    return {
      requirementId,
      requirementName,
      status: (failCount || 0) > 0 ? "FAIL" : "PASS",
      failures: failCount || 0,
    };
  });

  // 3) Summary: totals and regulation breakdown based on violations
  const totalTestsRes = await run(`MATCH (t:Test) RETURN count(t) AS total`);
  const totalTests = totalTestsRes.records[0].get("total").toNumber();

  // Build regulation breakdown from rules in the violations
  const regBreakdown = {};
  for (const v of violations) {
    for (const rule of (v.rules || [])) {
      const reg = rule.regulation || {};
      if (!reg.id) continue;
      regBreakdown[reg.id] = regBreakdown[reg.id] || { name: reg.name, failures: 0 };
      // count once per requirement per regulation to avoid overcounting per finding
      regBreakdown[reg.id].failures += 1;
    }
  }

  // 4) Test summary (PASS/FAIL per Test)
  const testsRes = await run(
    `
    MATCH (t:Test)
    OPTIONAL MATCH (s:Scan {id: $scanId})-[:FOUND]->(:Finding)-[:DETECTED_BY]->(t)
    WITH t, count(*) AS failCount
    RETURN t.id AS testId, failCount
    `,
    { scanId }
  );

  const tests = testsRes.records.map((r) => {
    const testId = r.get("testId");
    const failCount = r.get("failCount")?.toNumber ? r.get("failCount").toNumber() : r.get("failCount");
    return {
      testId,
      name: testId,
      status: (failCount || 0) > 0 ? "FAIL" : "PASS",
      failures: failCount || 0,
    };
  });

  return {
    scanId,
    summary: {
      totalTests,
      totalFailures: violations.length,
      regulationBreakdown: regBreakdown,
    },
    requirementStatuses,
    violations,
    tests,
  };
}

module.exports = { buildReport, buildSummary };
