// Privacy: Data sharing with third parties must be disclosed
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'privacy'})-[:HAS_EVIDENCE]->(e:Evidence {key:'data_sharing_disclosed'})
WHERE toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-privacy-data-sharing'})
MERGE (f)-[:MATCHES {reason:'Third-party data sharing not disclosed', createdAt:timestamp()}]->(req);
