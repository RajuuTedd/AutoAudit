// 

// services/axeService.js
const { spawn } = require("child_process");

/** Extract the last complete JSON object/array from a noisy string. */
function extractLastJsonBlock(s) {
  if (!s) return null;
  let depth = 0, start = -1, best = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        best = s.slice(start, i + 1);
        start = -1;
      }
    } else if (ch === "[" && depth === 0) {
      // allow top-level array too (axe --stdout returns an array)
      start = i;
      depth = 1; // treat array similar to object for pairing
    } else if (ch === "]" && depth > 0 && start !== -1) {
      depth--;
      if (depth === 0) {
        best = s.slice(start, i + 1);
        start = -1;
      }
    }
  }
  return best;
}

function runAxeCLI(targetUrl, { timeoutMs = 90000 } = {}) {
  return new Promise((resolve, reject) => {
    const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

    // Force the official CLI and emit JSON to stdout.
    const args = [
      "--yes", "--package", "@axe-core/cli",
      "axe",
      "--stdout",            // JSON to STDOUT
      targetUrl
    ];

    // Allow user to pin Chrome path if Puppeteer can’t launch bundled Chromium
    const env = { ...process.env };
    if (process.env.AXE_CHROME) {
      env.PUPPETEER_EXECUTABLE_PATH = process.env.AXE_CHROME;
    }

    const child = spawn(npxBin, args, { shell: false, env });

    let stdout = "", stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
      reject(new Error("axe scan timed out"));
    }, timeoutMs);

    child.stdout.on("data", d => { stdout += d.toString(); });
    child.stderr.on("data", d => { stderr += d.toString(); });
    child.on("error", err => { clearTimeout(timer); reject(err); });

    child.on("close", code => {
      clearTimeout(timer);
      if (timedOut) return;

      const combined = `${stdout}\n${stderr}`.trim();
      console.log("🧪 axe preview:", combined.slice(0, 300));

      // Common failure hint: wrong binary (shouldn’t happen with --package)
      if (/unknown option\s+-f/i.test(combined) || /command not found:\s*axe/i.test(combined)) {
        return reject(new Error("axe CLI failed: incorrect binary (ensure @axe-core/cli)"));
      }

      // axe --stdout outputs a JSON array; tolerate logs/noise around it
      let jsonText = null;
      if (combined.startsWith("[") || combined.startsWith("{")) jsonText = combined;
      if (!jsonText) jsonText = extractLastJsonBlock(combined);

      if (!jsonText) {
        return reject(new Error(`Axe did not return JSON (exit ${code}).`));
      }

      try {
        const json = JSON.parse(jsonText);
        resolve(json);
      } catch (e) {
        reject(new Error(`Failed to parse axe JSON: ${e.message}`));
      }
    });
  });
}

exports.runScan = async (url) => {
  let target = (url || "").trim();
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
  return await runAxeCLI(target, { timeoutMs: 90000 });
};