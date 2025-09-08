const { URL } = require("url");

/**
 * Normalize Puppeteer + Gemini results into a test output.
 * @param {object} raw - The raw result from policyParserService.runScan
 * @returns {object} normalized result
 */
function parse(raw) {
  if (raw.error) {
    return { status: "ERROR", details: { reason: raw.error } };
  }

  const violations = [];

  // Check for policy link detection (a basic requirement)
  if (!raw.privacyPolicyLink) {
    violations.push("No privacy policy link detected");
  }

  // Check for insecure cookies
  if (raw.insecureCookies?.length > 0) {
    violations.push("Insecure cookies without Secure/HttpOnly flag");
  }

  // Check for cookie banner
  if (!raw.cookieBannerFound) {
    violations.push("No cookie consent banner detected");
  }

  // Check for Gemini-detected issues
  if (raw.geminiAnalysis?.compliance_issues?.length) {
    violations.push(...raw.geminiAnalysis.compliance_issues);
  }

  return {
    status: violations.length ? "FAIL" : "PASS",
    details: {
      pageUrl: raw.url,
      violations,
      summary: raw.geminiAnalysis?.summary || null,
      sample: {
        policyLink: raw.privacyPolicyLink,
        cookieBannerFound: raw.cookieBannerFound,
        insecureCookies: raw.insecureCookies,
      },
    },
  };
}

module.exports = { parse };
