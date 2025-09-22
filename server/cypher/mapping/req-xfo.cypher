// Security header: X-Frame-Options must be DENY or SAMEORIGIN
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'headers'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(x:Evidence {key:'xfo_value'})
WITH f, x
WHERE x IS NULL OR NOT toUpper(x.value) IN ['DENY','SAMEORIGIN']
MATCH (req:Requirement {id:'req-xfo'})
MERGE (f)-[:MATCHES {reason:'Missing or weak X-Frame-Options', createdAt:timestamp()}]->(req);
