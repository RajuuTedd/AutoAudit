const { run, runFileMany, close } = require("../graph/neo4j");

(async () => {
  try {
    const result = await run("RETURN 1 AS ok");
    console.log("Neo4j connection test result:", result.records[0].get("ok"));

    await runFileMany("./cypher/constraints.cypher");
    console.log("Constraints (multiple statements) applied successfully.");
  } catch (err) {
    console.error("Neo4j operation failed:", err);
  } finally {
    await close();
  }
})();