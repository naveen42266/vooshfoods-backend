require("dotenv").config();
const express = require("express");
const cors = require("cors");
const todoRoutes = require("./routes/todoRoutes");
const { connectToDatabase } = require("./db");
const { PORT, ALLOWED_ORIGINS } = require("./config");

const app = express();

// CORS configuration
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["POST", "PUT", "GET", "DELETE"],
  credentials: true,
}));

app.use(express.json()); // Middleware for parsing JSON
app.use('/api/todoapp', todoRoutes); // Register routes

// Root route
app.get("/", (req, res) => {
  res.send("Hello");
});

// Start server and connect to database
app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Server is running on port ${PORT}`);
});
