// WCAG 1.4.3: Insufficient color contrast
MATCH (s:Scan {id: $scanId})-[:FOUND]->(f:Finding {tool:'axe'})-[:HAS_EVIDENCE]->(ev:Evidence {key:'contrast_ratio'})
WHERE toFloat(ev.value) < 4.5
MATCH (req:Requirement {id:'req-contrast'})
MERGE (f)-[:MATCHES {reason:'contrast_ratio < 4.5', createdAt:timestamp()}]->(req);
