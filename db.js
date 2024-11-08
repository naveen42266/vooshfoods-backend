const { MongoClient } = require("mongodb");
const { MONGO_URI, DATABASE_NAME } = require("./config");

let database;

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    database = client.db(DATABASE_NAME);
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

function getDatabase() {
  if (!database) {
    throw new Error("Database not initialized");
  }
  return database;
}

module.exports = { connectToDatabase, getDatabase };
