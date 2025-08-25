// parsers/curlHeaderParser.js

function checkCSP(headers) {
  return !!headers["content-security-policy"];
}
function checkXFO(headers) {
  return !!headers["x-frame-options"];
}
function checkXCTO(headers) {
  return headers["x-content-type-options"]?.toLowerCase() === "nosniff";
}
function checkReferrer(headers) {
  return !!headers["referrer-policy"];
}

exports.parse = ({ type, data }) => {
  const headers = data.headers || {};
  let ok = false;

  switch (type) {
    case "csp":
      ok = checkCSP(headers);
      return {
        status: ok ? "PASS" : "FAIL",
        details: { header: "content-security-policy", present: ok, sample: headers["content-security-policy"] || null }
      };

    case "xfo":
      ok = checkXFO(headers);
      return {
        status: ok ? "PASS" : "FAIL",
        details: { header: "x-frame-options", present: ok, sample: headers["x-frame-options"] || null }
      };

    case "xcto":
      ok = checkXCTO(headers);
      return {
        status: ok ? "PASS" : "FAIL",
        details: { header: "x-content-type-options", present: ok, expected: "nosniff", value: headers["x-content-type-options"] || null }
      };

    case "referrer":
      ok = checkReferrer(headers);
      return {
        status: ok ? "PASS" : "FAIL",
        details: { header: "referrer-policy", present: ok, sample: headers["referrer-policy"] || null }
      };

    default:
      return { status: "ERROR", details: { reason: `Unknown header check type: ${type}` } };
  }
};