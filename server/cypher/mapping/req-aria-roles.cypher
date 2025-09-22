// WCAG: ARIA roles/attributes issues
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'axe'})-[:HAS_EVIDENCE]->(er:Evidence {key:'axerule'})
WHERE er.value STARTS WITH 'aria-'
MATCH (req:Requirement {id:'req-aria-roles'})
MERGE (f)-[:MATCHES {reason:'ARIA role/attribute violation', createdAt:timestamp()}]->(req);
