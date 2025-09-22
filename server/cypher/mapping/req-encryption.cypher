// Security: Strong encryption required
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'ssl'})-[:HAS_EVIDENCE]->(e:Evidence {key:'encryption_strength'})
WHERE toInteger(e.value) < 128
MATCH (req:Requirement {id:'req-encryption'})
MERGE (f)-[:MATCHES {reason:'Encryption strength < 128-bit', createdAt:timestamp()}]->(req);
