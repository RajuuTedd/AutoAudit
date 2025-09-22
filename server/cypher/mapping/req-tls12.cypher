// Security: Modern TLS only (no TLS 1.0/1.1)
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'ssl'})-[:HAS_EVIDENCE]->(p:Evidence {key:'protocols'})
WHERE p.value CONTAINS 'TLS 1.0' OR p.value CONTAINS 'TLS 1.1'
MATCH (req:Requirement {id:'req-tls12'})
MERGE (f)-[:MATCHES {reason:'Legacy TLS protocol enabled (1.0/1.1)', createdAt:timestamp()}]->(req);
