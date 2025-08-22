// exports.parse = (scanData) => {
//   const endpoints = scanData.endpoints || [];

//   const hasGradeA = endpoints.some((e) => e.grade === "A" || e.grade === "A+");

//   return {
//     testName: "SSL Labs Scan",
//     status: hasGradeA ? "PASS" : "FAIL",
//     details: {
//       host: scanData.host,
//       endpointGrades: endpoints.map((e) => ({
//         ip: e.ipAddress,
//         grade: e.grade || "No Grade",
//       })),
//     },
//     violations: hasGradeA
//       ? []
//       : [
//           {
//             requirementId: "SSL-001",
//             description: "Server SSL grade below A",
//           },
//         ],
//   };
// };

exports.parse = (scanData) => {
  const endpoints = Array.isArray(scanData?.endpoints) ? scanData.endpoints : [];
  const hasGradeA = endpoints.some(e => e.grade === "A" || e.grade === "A+");

  return {
    status: hasGradeA ? "PASS" : "FAIL",
    details: {
      host: scanData.host,
      endpointGrades: endpoints.map(e => ({
        ip: e.ipAddress,
        grade: e.grade || "No Grade"
      }))
    }
  };
};
