const axios = require("axios");

async function waitForSSLAnalysis(host) {
  let retries = 0;
  const maxRetries = 10;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (retries < maxRetries) {
    const response = await axios.get(
      `https://api.ssllabs.com/api/v3/analyze?host=${host}&all=done`
    );
    const data = response.data;

    if (data.status === "READY") return data;
    if (data.status === "ERROR") throw new Error("SSL Labs scan failed");

    await delay(5000);
    retries++;
  }

  throw new Error("SSL Labs scan timed out");
}

exports.runScan = async (url) => {
  const host = url.replace(/^https?:\/\//, "");
  return await waitForSSLAnalysis(host);
};
