const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const loadJSON = (filename) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "seeds", filename), "utf-8"));

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const db = mongoose.connection.db;

    console.log("🧹 Clearing old collections...");
    await db.collection("regulations").deleteMany({});
    await db.collection("rules").deleteMany({});
    await db.collection("requirements").deleteMany({});
    await db.collection("tests").deleteMany({});

    console.log("📥 Inserting fresh seed data...");
    await db.collection("regulations").insertMany(loadJSON("regulations.json"));
    await db.collection("rules").insertMany(loadJSON("rules.json"));
    await db.collection("requirements").insertMany(loadJSON("requirements.json"));
    await db.collection("tests").insertMany(loadJSON("tests.json"));

    console.log("✅ Seeded database successfully");
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seedDatabase();