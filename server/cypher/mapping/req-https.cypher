// Security: Site must use HTTPS
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'ssl'})-[:HAS_EVIDENCE]->(e:Evidence {key:'https_supported'})
WHERE toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-https'})
MERGE (f)-[:MATCHES {reason:'HTTPS not supported/enforced', createdAt:timestamp()}]->(req);
