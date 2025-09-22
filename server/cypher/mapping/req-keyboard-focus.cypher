// WCAG: Keyboard / Focus issues
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'axe'})-[:HAS_EVIDENCE]->(er:Evidence {key:'axerule'})
WHERE er.value IN ['focus-order','focus-visible','keyboard','tabindex','focusable-content']
MATCH (req:Requirement {id:'req-keyboard-focus'})
MERGE (f)-[:MATCHES {reason:'Keyboard/focus accessibility issue', createdAt:timestamp()}]->(req);
