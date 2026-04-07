const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || "codemaya",
  });
}

module.exports = { connectDB };
