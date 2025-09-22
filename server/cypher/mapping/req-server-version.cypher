// Security: Server version disclosure
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'nikto'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(sv:Evidence {key:'finding_code', value:'server_version'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(ver:Evidence {key:'service_version'})
WITH f, sv, ver
WHERE sv IS NOT NULL OR ver IS NOT NULL
MATCH (req:Requirement {id:'req-server-version'})
MERGE (f)-[:MATCHES {reason:'Server version disclosed', createdAt:timestamp()}]->(req);
