const { runCypher } = require("../graph/neo4j/neo4j.js");

async function buildReport(scanId) {
  // 1) Violations
  const violationsRes = await runCypher(
    `
    MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding)-[:MATCHES]->(req:Requirement)-[:PART_OF]->(rule:Rule)-[:UNDER]->(reg:Regulation)
    OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(e:Evidence)
    RETURN f.id AS findingId, f.tool AS tool, f.severity AS severity,
           req.id AS requirementId, req.name AS requirementName,
           rule.id AS ruleId, reg.id AS regulationId,
           collect({key: e.key, value: e.value}) AS evidence
    ORDER BY regulationId, ruleId, requirementId
    `,
    { scanId }
  );

  const violations = violationsRes.records.map((r) => r.toObject());

  // 2) Rollups + Requirement Status
  const reqStatusRes = await runCypher(
    `
    MATCH (req:Requirement)-[:TESTED_BY]->(t:Test)
    OPTIONAL MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding)-[:MATCHES]->(req)
    WITH req, count(f) AS failCount
    RETURN req.id AS requirementId, req.name AS requirementName, failCount
    `,
    { scanId }
  );

  const requirementStatuses = reqStatusRes.records.map((r) => {
    const obj = r.toObject();
    return {
      requirementId: obj.requirementId,
      requirementName: obj.requirementName,
      status: obj.failCount > 0 ? "FAIL" : "PASS",
      failures: obj.failCount,
    };
  });

  // 3) Summary
  const totalTests = await runCypher(`MATCH (t:Test) RETURN count(t) AS total`);
  const totalFailures = violations.length;

  const regBreakdown = {};
  violations.forEach((v) => {
    regBreakdown[v.regulationId] = regBreakdown[v.regulationId] || {
      failures: 0,
    };
    regBreakdown[v.regulationId].failures += 1;
  });

  // 4) Test summary (PASS/FAIL)
  const testsRes = await runCypher(
    `
    MATCH (t:Test)
    OPTIONAL MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding)-[:DETECTED_BY]->(t)
    WITH t, count(f) AS failCount
    RETURN t.id AS testId, failCount
    `,
    { scanId }
  );

  const tests = testsRes.records.map((r) => {
    const obj = r.toObject();
    return {
      testId: obj.testId,
      name: obj.testId,
      status: obj.failCount > 0 ? "FAIL" : "PASS",
      failures: obj.failCount,
    };
  });

  return {
    scanId,
    summary: {
      totalTests: totalTests.records[0].get("total").toNumber(),
      totalFailures,
      regulationBreakdown: regBreakdown,
    },
    requirementStatuses, // 👈 NEW
    violations,
    tests,
  };
}

module.exports = { buildReport };
