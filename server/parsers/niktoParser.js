// parsers/niktoParser.js
exports.parse = (niktoRaw) => {
  // ---- Case 1: Structured JSON from Nikto ----
  if (niktoRaw && Array.isArray(niktoRaw.vulnerabilities)) {
    const vulns = niktoRaw.vulnerabilities;

    // Treat medium+ (>=2) or clear vuln indicators as significant
    const significant = vulns.filter(v =>
      (typeof v.severity === "number" && v.severity >= 2) ||
      /vuln|cve-|exploit|xss|sql|clickjack|dir(ectory)? list|insecure|outdated|deprecated/i.test(
        (v.msg || v.description || "")
      )
    );

    return {
      status: significant.length ? "FAIL" : "PASS",
      details: {
        totalFindings: vulns.length,
        criticalFindings: significant.length,
        findings: vulns.map(v => ({
          id: v.id || v.osvdb || "unknown",
          severity: (typeof v.severity === "number") ? v.severity : null,
          msg: v.msg || v.description || "",
          url: v.url || ""
        }))
      }
    };
  }

  // ---- Case 2: Fallback text parsing (heuristic) ----
  const rawText = (niktoRaw && niktoRaw.raw) ? niktoRaw.raw : "";

  // Pull lines that look like findings ("+ <finding>") and ignore boilerplate
  const lines = rawText.split(/\r?\n/).map(l => l.trim());
  const findingLines = lines.filter(l =>
    l.startsWith("+") &&
    !/^\+\s*(Target|Start Time|End Time|OK)\b/i.test(l)
  );

  // Strong indicators of real issues
  const significantText = findingLines.filter(l =>
    /(vulnerab|cve-\d{4}-\d+|osvdb|exploit|xss|sql|clickjack|frame-?options|content-?security-?policy|x-content-type-options|x-xss-protection|server leaks|directory (index|list)|trace method|allowed http methods|insecure|outdated|deprecated)/i
      .test(l)
  );

  // Heuristic: if we saw ANY finding lines, treat as FAIL to avoid overpassing,
  // but weight "significant" lines first.
  const status = (significantText.length > 0 || findingLines.length > 0) ? "FAIL" : "PASS";

  return {
    status,
    details: {
      totalFindingLines: findingLines.length,
      sample: findingLines.slice(0, 10)
    }
  };
};