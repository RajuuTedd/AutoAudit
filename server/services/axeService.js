const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

/**
 * Direct Puppeteer execution to bypass ChromeDriver version mismatches.
 */

async function runAxePuppeteer(targetUrl, { timeoutMs = 90000 } = {}) {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (_) {
    throw new Error("Puppeteer not found. Run: npm install puppeteer");
  }

  const axe = require("axe-core");

  // Clean the path (essential for Windows spaces)
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    ? process.env.PUPPETEER_EXECUTABLE_PATH.replace(/["']/g, "")
    : null;

  const launchOpts = {
    headless: true,
    executablePath: executablePath,
    // CRITICAL FLAGS FOR WINDOWS STABILITY:
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // Helps prevent zombie processes on Windows
    ],
  };

  let browser;
  try {
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();

    // Set a realistic viewport
    await page.setViewport({ width: 1280, height: 800 });
    await page.setBypassCSP(true);

    // Navigate with a slightly more relaxed wait condition
    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded", // Faster than 'load'
      timeout: timeoutMs,
    });

    // Inject Axe
    await page.evaluate(axe.source);

    // Run Scan
    const results = await page.evaluate(async () => {
      if (!window.axe) throw new Error("Axe failed to inject");
      return await window.axe.run();
    });

    return {
      violations: Array.isArray(results.violations) ? results.violations : [],
    };
  } catch (err) {
    console.error("DETAILED PUPPETEER ERROR:", err.message);
    throw err; // This allows the error to be caught by exports.runScan
  } finally {
    if (browser) await browser.close();
  }
}

/** Extract the last complete JSON object/array from a noisy string. */
function extractLastJsonBlock(s) {
  if (!s) return null;
  let depth = 0,
    start = -1,
    best = null;
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
      start = i;
      depth = 1;
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
    const isWindows = process.platform === "win32";

    // Use path.join to correctly locate the local binary
    const axeBin = isWindows
      ? path.join(__dirname, "..", "node_modules", ".bin", "axe.cmd")
      : "npx";

    const env = { ...process.env };

    // Simplified arguments to avoid space-parsing errors in the shell
    const args = isWindows
      ? ["--stdout", targetUrl]
      : ["axe", "--stdout", targetUrl];

    if (isWindows && process.env.AXE_CHROME) {
      // Clean any accidental quotes and set the variable Puppeteer actually looks for
      const cleanPath = process.env.AXE_CHROME.replace(/["']/g, "");
      env.PUPPETEER_EXECUTABLE_PATH = cleanPath;
      env.CHROME_BIN = cleanPath;
    }

    // Use shell: true only on Windows to resolve the .cmd extension
    const child = spawn(axeBin, args, { shell: isWindows, env });

    let stdout = "",
      stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
      reject(new Error("axe scan timed out"));
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) return;

      const combined = (stdout + stderr).trim();
      let jsonText = null;

      // Ensure we only try to parse if the output looks like JSON
      if (combined.startsWith("[") || combined.startsWith("{")) {
        jsonText = combined;
      } else {
        jsonText = extractLastJsonBlock(combined);
      }

      if (!jsonText) {
        return reject(
          new Error(`Axe failed (exit ${code}). stderr: ${stderr}`),
        );
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
  try {
    let target = (url || "").trim();
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

    console.log(`Starting Axe scan for: ${target}`);
    return await runAxePuppeteer(target, { timeoutMs: 90000 });
  } catch (err) {
    console.error("Axe Service Export Error:", err.message);
    throw err;
  }
};
// exports.runScan = async (url) => {
//   let target = (url || "").trim();
//   if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

//   // Try CLI first (fast path). If it fails to produce JSON, fallback to Puppeteer.
//   try {
//     const cliJson = await runAxeCLI(target, { timeoutMs: 90000 });
//     // Some axe CLIs return an array of results; normalize to `{ violations: [] }`
//     if (Array.isArray(cliJson)) {
//       const first = cliJson[0] || {};
//       return {
//         violations: Array.isArray(first.violations) ? first.violations : [],
//       };
//     }
//     if (cliJson && Array.isArray(cliJson.violations)) return cliJson;
//     if (
//       cliJson &&
//       cliJson.results &&
//       Array.isArray(cliJson.results.violations)
//     ) {
//       return { violations: cliJson.results.violations };
//     }
//     // Fallback if shape is unexpected
//     return { violations: [] };
//   } catch (cliErr) {
//     console.warn("axe CLI failed, falling back to Puppeteer:", cliErr.message);
//     return await runAxePuppeteer(target, { timeoutMs: 90000 });
//   }
// };
