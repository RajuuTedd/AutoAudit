// Security: HSTS must be present
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'ssl'})-[:HAS_EVIDENCE]->(e:Evidence {key:'hsts_present'})
WHERE toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-hsts'})
MERGE (f)-[:MATCHES {reason:'HSTS not present', createdAt:timestamp()}]->(req);
