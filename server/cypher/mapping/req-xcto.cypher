// Security header: X-Content-Type-Options should be 'nosniff'
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'headers'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(x:Evidence {key:'xcto_value'})
WITH f, x
WHERE x IS NULL OR toLower(x.value) <> 'nosniff'
MATCH (req:Requirement {id:'req-xcto'})
MERGE (f)-[:MATCHES {reason:'Missing or incorrect X-Content-Type-Options', createdAt:timestamp()}]->(req);
