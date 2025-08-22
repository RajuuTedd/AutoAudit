const sslLabsService = require("./sslLabsService");
const sslLabsParser = require("../parsers/sslLabsParser");

exports.runAllTests = async (url) => {
  const results = [];

  // ✅ Run SSL Labs Test
  const sslRaw = await sslLabsService.runScan(url);
  const sslResult = sslLabsParser.parse(sslRaw);
  results.push(sslResult);

  // ❌ (future) Add Nmap/Nikto/Gemini etc.
  // const nmapRaw = await nmapService.runScan(url);
  // const nmapResult = nmapParser.parse(nmapRaw);
  // results.push(nmapResult);

  return results;
};
