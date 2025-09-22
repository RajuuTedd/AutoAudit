// Security header: CSP must exist
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'headers'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(e:Evidence {key:'csp_present'})
WITH f, e
WHERE e IS NULL OR toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-csp'})
MERGE (f)-[:MATCHES {reason:'Missing Content-Security-Policy header', createdAt:timestamp()}]->(req);
