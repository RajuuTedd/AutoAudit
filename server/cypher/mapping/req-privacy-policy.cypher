// Privacy: Privacy policy must exist
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'privacy'})-[:HAS_EVIDENCE]->(e:Evidence {key:'policy_present'})
WHERE toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-privacy-policy'})
MERGE (f)-[:MATCHES {reason:'Privacy policy not found', createdAt:timestamp()}]->(req);
