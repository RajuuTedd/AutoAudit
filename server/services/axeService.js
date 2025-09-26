// 

// services/axeService.js
const { spawn } = require("child_process");

async function runAxePuppeteer(targetUrl, { timeoutMs = 90000 } = {}) {
  // Try puppeteer first, then puppeteer-core (with user-provided Chrome path)
  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch (_) {
    try { puppeteer = require('puppeteer-core'); }
    catch (e) {
      throw new Error('Puppeteer not installed. Run `npm i -D puppeteer` or set PUPPETEER_EXECUTABLE_PATH and install puppeteer-core.');
    }
  }
  const axe = require('axe-core');

  const launchOpts = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote'
    ]
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();

    // Allow injecting scripts even if the site has strict CSP
    await page.setBypassCSP(true);

    page.setDefaultNavigationTimeout(timeoutMs);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Inject axe-core; first try inline source, then fall back to resolved file path
    await page.addScriptTag({ content: axe.source });

    let hasAxe = await page.evaluate(() => !!window.axe);
    if (!hasAxe) {
      try {
        await page.addScriptTag({ path: require.resolve('axe-core') });
        hasAxe = await page.evaluate(() => !!window.axe);
      } catch (_) { /* ignore and check below */ }
    }
    if (!hasAxe) {
      throw new Error('axe-core not available in page after injection (CSP or load issue)');
    }

    const results = await page.evaluate(async () => {
      return await window.axe.run(document, {});
    });

    // Normalize to the same shape expected by ingestors
    return { violations: Array.isArray(results.violations) ? results.violations : [] };
  } finally {
    await browser.close();
  }
}

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
      "-q",                 // quiet: reduce noise on stdout
      "-r", "json",        // force JSON reporter
      "--stdout",           // emit JSON to STDOUT
      targetUrl
    ];

    // Allow user to pin Chrome path if Puppeteer can’t launch bundled Chromium
    const env = { ...process.env };
    env.AXE_DRIVER = env.AXE_DRIVER || 'puppeteer';
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

      // Common failure hint: wrong binary (shouldn’t happen with --package)
      if (/unknown option\s+-f/i.test(combined) || /command not found:\s*axe/i.test(combined)) {
        return reject(new Error("axe CLI failed: incorrect binary (ensure @axe-core/cli)"));
      }

      // Prefer stdout (should contain JSON); fall back to combined if needed
      let jsonText = null;
      const tryAreas = [stdout, `${stdout}\n${stderr}`.trim()];
      for (const area of tryAreas) {
        if (!area) continue;
        if (area.startsWith("[") || area.startsWith("{")) { jsonText = area; break; }
        const extracted = extractLastJsonBlock(area);
        if (extracted) { jsonText = extracted; break; }
      }

      if (!jsonText) {
        const errSnippet = (stderr || "").slice(0, 300).replace(/\n/g, ' ');
        return reject(new Error(`Axe did not return JSON (exit ${code}). stderr: ${errSnippet}`));
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
  let target = (url || '').trim();
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

  // Try CLI first (fast path). If it fails to produce JSON, fallback to Puppeteer.
  try {
    const cliJson = await runAxeCLI(target, { timeoutMs: 90000 });
    // Some axe CLIs return an array of results; normalize to `{ violations: [] }`
    if (Array.isArray(cliJson)) {
      const first = cliJson[0] || {};
      return { violations: Array.isArray(first.violations) ? first.violations : [] };
    }
    if (cliJson && Array.isArray(cliJson.violations)) return cliJson;
    if (cliJson && cliJson.results && Array.isArray(cliJson.results.violations)) {
      return { violations: cliJson.results.violations };
    }
    // Fallback if shape is unexpected
    return { violations: [] };
  } catch (cliErr) {
    console.warn('axe CLI failed, falling back to Puppeteer:', cliErr.message);
    return await runAxePuppeteer(target, { timeoutMs: 90000 });
  }
};