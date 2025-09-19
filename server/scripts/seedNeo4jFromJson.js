

// server/scripts/seedNeo4jFromJson.js
// Imports JSON seeds from server/seeds/*.json into Neo4j (Aura or local)

const fs = require('fs');
const path = require('path');
const { runTx, close } = require('../graph/neo4j');

function readJson(relPath) {
  const abs = path.join(__dirname, '..', 'seeds', relPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Expected array in ${relPath}, got ${typeof data}`);
  }
  return data;
}

(async () => {
  console.log('🔧 Loading seed files from server/seeds ...');
  const regulations = readJson('regulations.json');
  const rules = readJson('rules.json');
  const requirements = readJson('requirements.json');
  const tests = readJson('tests.json');

  console.log(`• Regulations: ${regulations.length}`);
  console.log(`• Rules:       ${rules.length}`);
  console.log(`• Requirements:${requirements.length}`);
  console.log(`• Tests:       ${tests.length}`);

  try {
    await runTx(async (tx) => {
      // 1) Regulations
      await tx.run(
        `
        UNWIND $regs AS r
        MERGE (n:Regulation {id: r._id})
          ON CREATE SET n.createdAt = timestamp()
        SET
          n.name = coalesce(r.name, n.name),
          n.jurisdiction = coalesce(r.jurisdiction, n.jurisdiction),
          n.version = coalesce(r.version, n.version),
          n.description = coalesce(r.description, n.description)
        `,
        { regs: regulations }
      );

      // 2) Rules + UNDER relation to Regulation
      await tx.run(
        `
        UNWIND $rules AS rl
        MERGE (rule:Rule {id: rl._id})
          ON CREATE SET rule.createdAt = timestamp()
        SET
          rule.title = coalesce(rl.title, rule.title),
          rule.article_number = coalesce(rl.article_number, rule.article_number),
          rule.description = coalesce(rl.description, rule.description)
        WITH rl, rule
        MATCH (reg:Regulation {id: rl.regulation_id})
        MERGE (rule)-[:UNDER]->(reg)
        `,
        { rules }
      );

      // 3) Requirements + PART_OF link(s) to Rule(s)
      await tx.run(
        `
        UNWIND $reqs AS rq
        MERGE (req:Requirement {id: rq._id})
          ON CREATE SET req.createdAt = timestamp()
        SET
          req.title = coalesce(rq.title, req.title),
          req.description = coalesce(rq.description, req.description),
          req.fix_suggestion = coalesce(rq.fix_suggestion, req.fix_suggestion),
          req.severity_default = coalesce(rq.severity_default, req.severity_default, 'MEDIUM')
        WITH rq, req
        UNWIND coalesce(rq.rule_ids, []) AS rid
        MATCH (rule:Rule {id: rid})
        MERGE (req)-[:PART_OF]->(rule)
        `,
        { reqs: requirements }
      );

      // 4) Tests
      await tx.run(
        `
        UNWIND $tests AS t
        MERGE (test:Test {id: t._id})
          ON CREATE SET test.createdAt = timestamp()
        SET
          test.name = coalesce(t.name, test.name),
          test.tool = coalesce(t.tool, test.tool),
          test.command = coalesce(t.command, test.command)
        `,
        { tests }
      );

      // 5) Requirement  → TESTED_BY → Test (from requirements.test_ids)
      await tx.run(
        `
        UNWIND $reqs AS rq
        MATCH (req:Requirement {id: rq._id})
        UNWIND coalesce(rq.test_ids, []) AS tid
        MATCH (test:Test {id: tid})
        MERGE (req)-[:TESTED_BY]->(test)
        `,
        { reqs: requirements }
      );

      // 6) Reinforce from tests.requirement_ids (in case seeds declare coverage here too)
      await tx.run(
        `
        UNWIND $tests AS t
        MATCH (test:Test {id: t._id})
        UNWIND coalesce(t.requirement_ids, []) AS qid
        MATCH (req:Requirement {id: qid})
        MERGE (req)-[:TESTED_BY]->(test)
        `,
        { tests }
      );
    });

    console.log('✅ Seed data imported into Neo4j successfully.');
  } catch (err) {
    console.error('❌ Failed to seed Neo4j:', err);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();