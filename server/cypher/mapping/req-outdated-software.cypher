// Security: Outdated software detected
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'nikto'})-[:HAS_EVIDENCE]->(e:Evidence {key:'finding_code', value:'outdated_software'})
MATCH (req:Requirement {id:'req-outdated-software'})
MERGE (f)-[:MATCHES {reason:'Outdated software detected', createdAt:timestamp()}]->(req);
