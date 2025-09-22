// Security/Privacy header: Referrer-Policy must be present
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'headers'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(r:Evidence {key:'referrer_policy_value'})
WITH f, r
WHERE r IS NULL OR size(trim(r.value)) = 0
MATCH (req:Requirement {id:'req-referrer'})
MERGE (f)-[:MATCHES {reason:'Missing Referrer-Policy header', createdAt:timestamp()}]->(req);
