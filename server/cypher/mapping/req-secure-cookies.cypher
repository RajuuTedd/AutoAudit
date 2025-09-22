// Cookies: Secure cookie practices
MATCH (s:Scan {id:$scanId})-[:FOUND]->(f:Finding {tool:'cookies'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(cat:Evidence {key:'cookie_category'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(pre:Evidence {key:'set_before_consent'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(sec:Evidence {key:'secure_flag'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(httponly:Evidence {key:'httponly_flag'})
OPTIONAL MATCH (f)-[:HAS_EVIDENCE]->(ss:Evidence {key:'samesite_value'})
WITH f, cat, pre, sec, httponly, ss
WHERE (cat.value <> 'strictly-necessary' AND toLower(pre.value) = 'true')
   OR toLower(sec.value) = 'false'
   OR toLower(httponly.value) = 'false'
   OR (toLower(coalesce(ss.value,'')) = 'none' AND toLower(sec.value) <> 'true')
MATCH (req:Requirement {id:'req-secure-cookies'})
MERGE (f)-[:MATCHES {reason:'Cookie consent/flags violation', createdAt:timestamp()}]->(req);
