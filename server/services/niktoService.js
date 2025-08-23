// services/niktoService.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Spawn a process and collect stdout/stderr with a timeout.
 */
function spawnWithTimeout(cmd, args, { timeoutMs = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { shell: true });
    let stdout = "", stderr = "";
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      try { child.kill("SIGKILL"); } catch {}
      reject(new Error("Nikto scan hard timed out (>60s)"));
    }, timeoutMs);

    child.stdout.on("data", d => (stdout += d.toString()));
    child.stderr.on("data", d => (stderr += d.toString()));
    child.on("error", err => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", code => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

/**
 * Quick JSON run: fast flags + write JSON to a temp file and read it back.
 * Falls back to plain-text run if JSON is unavailable.
 */
async function runNiktoJsonQuick(targetUrl, timeoutMs) {
  const tmpFile = path.join(
    os.tmpdir(),
    `nikto-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
  );

  // Fast but still useful: cap total time and request time, restrict scope a bit
  const args = [
    "-h", targetUrl,
    "-nointeractive",
    "-maxtime", "30",   // stop after 30s
    "-timeout", "5",    // each request max 5s
    "-Tuning", "b",     // quick subset (interesting files)
    "-Format", "json",
    "-output", tmpFile
  ];

  const { code, stderr } = await spawnWithTimeout("nikto", args, { timeoutMs });
  if (code !== 0) {
    throw new Error(stderr && stderr.trim() ? stderr.trim() : `Nikto failed with code ${code}`);
  }

  try {
    const data = fs.readFileSync(tmpFile, "utf-8");
    try { fs.unlinkSync(tmpFile); } catch {}
    return JSON.parse(data);
  } catch (e) {
    try { fs.unlinkSync(tmpFile); } catch {}
    throw new Error(`Failed to read Nikto JSON: ${e.message}`);
  }
}

/**
 * Plain fast run: capture stdout for heuristic parsing.
 */
async function runNiktoPlainQuick(targetUrl, timeoutMs) {
  const args = [
    "-h", targetUrl,
    "-nointeractive",
    "-maxtime", "30",
    "-timeout", "5",
    "-Tuning", "b"
  ];

  const { code, stdout, stderr } = await spawnWithTimeout("nikto", args, { timeoutMs });
  if (code !== 0 && !stdout) {
    throw new Error(stderr && stderr.trim() ? stderr.trim() : `Nikto failed with code ${code}`);
  }
  return { raw: stdout, stderr, code };
}

exports.runScan = async (url) => {
  let target = url;
  if (!/^https?:\/\//i.test(target)) target = `http://${target}`;

  try {
    // Prefer quick JSON mode (more reliable FAIL/PASS parsing)
    return await runNiktoJsonQuick(target, 60000);
  } catch {
    // Fallback to plain quick run
    return await runNiktoPlainQuick(target, 60000);
  }
};