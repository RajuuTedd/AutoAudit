// Security: Default credentials detected
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'nikto'})-[:HAS_EVIDENCE]->(e:Evidence {key:'finding_code', value:'default_creds'})
MATCH (req:Requirement {id:'req-default-credentials'})
MERGE (f)-[:MATCHES {reason:'Default credentials detected', createdAt:timestamp()}]->(req);
