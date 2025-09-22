// Privacy: Controller identity must be disclosed
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'privacy'})-[:HAS_EVIDENCE]->(e:Evidence {key:'controller_identity_present'})
WHERE toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-privacy-controller-identity'})
MERGE (f)-[:MATCHES {reason:'Controller identity not disclosed', createdAt:timestamp()}]->(req);
