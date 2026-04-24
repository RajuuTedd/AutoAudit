// /server/index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config({ path: path.join(__dirname, ".env") });

const scanRoutes = require("./routes/scanRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

// Middleware
app.use(express.json());

// ✅ Use routes
app.use("/api", scanRoutes);

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // ✅ Start server only after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
