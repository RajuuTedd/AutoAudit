// Security: Directory listing enabled
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'nikto'})-[:HAS_EVIDENCE]->(e:Evidence {key:'finding_code', value:'dir_listing'})
MATCH (req:Requirement {id:'req-dir-listing'})
MERGE (f)-[:MATCHES {reason:'Directory listing enabled', createdAt:timestamp()}]->(req);
