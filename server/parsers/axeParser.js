exports.parse = (axeOutput) => {
  const arr = Array.isArray(axeOutput) ? axeOutput : [];
  const first = arr[0] || {};

  const violations = Array.isArray(first.violations) ? first.violations : [];

  // Simple impact tally for diagnostics
  const impactCount = { critical: 0, serious: 0, moderate: 0, minor: 0, unknown: 0 };
  for (const v of violations) {
    const k = (v.impact || "unknown").toLowerCase();
    if (impactCount[k] !== undefined) impactCount[k] += 1; else impactCount.unknown += 1;
  }

  return {
    status: violations.length ? "FAIL" : "PASS",
    details: {
      pageUrl: first.url || null,
      totalViolations: violations.length,
      byImpact: impactCount,
      // lightweight sample for UI drilldown; keep it small
      sample: violations.slice(0, 8).map(v => ({
        id: v.id,
        impact: v.impact || null,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes?.length || 0
      }))
    }
  };
};