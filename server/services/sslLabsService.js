const axios = require("axios");

async function waitForSSLAnalysis(host) {
  let retries = 0;
  const maxRetries = 15; // Increased retries
  // Initial delay of 10 seconds, as SSL scans are rarely faster than that
  let currentDelay = 10000;

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (retries < maxRetries) {
    try {
      console.log(`🔁 Polling SSL Labs for ${host}... Attempt ${retries + 1}`);
      const response = await axios.get(
        `https://api.ssllabs.com/api/v3/analyze?host=${host}&all=done`,
      );
      const data = response.data;

      if (data.status === "READY") {
        console.log(`✅ SSL Scan for ${host} complete.`);
        return data;
      }

      if (data.status === "ERROR") {
        throw new Error("SSL Labs reported a scan error for this host");
      }

      // If status is IN_PROGRESS or DNS, wait and retry
      console.log(`Status: ${data.status}. Waiting ${currentDelay / 1000}s...`);
      await delay(currentDelay);

      // Exponential backoff: increase delay for next time, cap at 30s
      currentDelay = Math.min(currentDelay * 1.5, 30000);
      retries++;
    } catch (err) {
      // If we get a 529 or 503, wait longer and retry instead of crashing
      if (
        err.response &&
        (err.response.status === 529 || err.response.status === 503)
      ) {
        console.warn("⚠️ SSL Labs is overloaded (529/503). Backing off...");
        await delay(20000); // Wait 20 seconds specifically for rate limits
        retries++;
      } else {
        throw err;
      }
    }
  }

  throw new Error("SSL Labs scan timed out after multiple attempts");
}

exports.runScan = async (url) => {
  const host = url.replace(/^https?:\/\//, "").split("/")[0]; // Ensure only the hostname is passed
  return await waitForSSLAnalysis(host);
};
