// services/curlHeaderService.js
const { spawn } = require("child_process");

function head(url, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const args = ["-sI", "-L", "--max-time", "10", target]; // HEAD request, follow redirects

    const child = spawn("curl", args, { shell: true });
    let stdout = "", stderr = "";

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("curl HEAD timed out"));
    }, timeoutMs);

    child.stdout.on("data", d => (stdout += d.toString()));
    child.stderr.on("data", d => (stderr += d.toString()));

    child.on("close", code => {
      clearTimeout(timer);
      if (code !== 0 && !stdout) return reject(new Error(stderr || `curl failed (${code})`));

      const lines = stdout.split(/\r?\n/).filter(Boolean);
      const statusLine = lines[0] || "";
      const headers = {};
      for (const line of lines.slice(1)) {
        const idx = line.indexOf(":");
        if (idx > 0) {
          const key = line.slice(0, idx).trim().toLowerCase();
          const value = line.slice(idx + 1).trim();
          if (!(key in headers)) headers[key] = value;
        }
      }
      resolve({ statusLine, headers, raw: stdout });
    });
  });
}

exports.fetchHeaders = async (url) => {
  return await head(url);
};