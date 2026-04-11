const scanPipeline = require("../services/scanPipeline");

const targetWebsites = [
  "https://example.com",
  "https://testsite1.com",
  // Add 20+ URLs here (use the test sites I gave you earlier!)
];

async function runBulkAudit() {
  console.log("Starting Research Data Collection...");
  for (const url of targetWebsites) {
    try {
      console.log(`Scanning: ${url}`);
      await scanPipeline.runScan(url);
    } catch (err) {
      console.error(`Failed ${url}:`, err.message);
    }
  }
  console.log("Data Collection Complete. Check Neo4j for results.");
}

runBulkAudit();
