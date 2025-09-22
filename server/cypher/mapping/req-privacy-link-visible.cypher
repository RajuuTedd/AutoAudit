// Privacy: Privacy link must be visible
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'privacy'})-[:HAS_EVIDENCE]->(e:Evidence {key:'privacy_link_present'})
WHERE toLower(e.value) = 'false'
MATCH (req:Requirement {id:'req-privacy-link-visible'})
MERGE (f)-[:MATCHES {reason:'Privacy link not visible on page', createdAt:timestamp()}]->(req);
