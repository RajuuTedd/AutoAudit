// WCAG: Image alt text missing
MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding {tool:'axe'})-[:HAS_EVIDENCE]->(er:Evidence {key:'axerule', value:'image-alt'})
MATCH (req:Requirement {id:'req-image-alt'})
MERGE (f)-[:MATCHES {reason:'Missing alt attribute on image', createdAt:timestamp()}]->(req);
