const express = require("express");
const multer = require("multer");
const uuid = require("uuid");
const { getDatabase } = require("../db");
const { COLLECTION_NAME } = require("../config");
const { authenticateToken, extractUserFromToken } = require("../middlewares/authMiddleware")
const router = express.Router();
const upload = multer();

// Helper function to generate unique ID
function generateRandomId() {
  return uuid.v4();
}

// Middleware to get userId from request (assuming it's in req.user from authentication middleware)
const getUserId = (req) => req.user?.id; // or modify as per your auth setup

// Get Notes (only notes for the authenticated user)
router.get("/getTasks", authenticateToken, async (req, res) => {
  // console.log(req)
  try {
    const userId = req.userId; // Extracted from the token
    const database = getDatabase();
    const result = await database.collection(COLLECTION_NAME).find({ userId }).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Note (with userId)
router.post("/addTask", extractUserFromToken, upload.none(), async (req, res) => {
  try {
    const userId = getUserId(req);
    const database = getDatabase();
    const newTask = {
      id: generateRandomId(),
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      deadline: req.body.deadline,
      createdAt: req.body.createdAt,
      userId,
    };
    await database.collection(COLLECTION_NAME).insertOne(newTask);
    res.json({ message: "Added Successfully", newTask });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update Note (only if it belongs to the authenticated user)
router.put("/updateTask", extractUserFromToken, upload.none(), async (req, res) => {
  try {
    const taskId = req.query.id;
    const userId = getUserId(req);  // Retrieve the authenticated user ID from the token
    const database = getDatabase();  // Get the database connection
    const existingTask = await database.collection(COLLECTION_NAME).findOne({ id: taskId, userId });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // Only update the fields that can be modified, and set updatedAt automatically
    const updatedTask = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      deadline: req.body.deadline,
      updatedAt: new Date().toISOString(),  // Set updatedAt to the current date and time
    };

    // Perform the update in the database
    await database.collection(COLLECTION_NAME).updateOne({ id: taskId, userId }, { $set: updatedTask });

    // Respond with the updated task information
    res.json({ message: "Updated Successfully", updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Status (only if it belongs to the authenticated user)
router.put("/updateStatus", extractUserFromToken, upload.none(), async (req, res) => {
  try {
    const taskId = req.query.id;
    const userId = getUserId(req);  // Retrieve the authenticated user ID from the token
    const database = getDatabase();  // Get the database connection
    const existingTask = await database.collection(COLLECTION_NAME).findOne({ id: taskId, userId });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // Only update the status and automatically update the updatedAt field
    const updatedStatus = {
      status: req.body.status,
      updatedAt: new Date().toISOString(),  // Set the updatedAt field to the current time
    };

    // Perform the update in the database
    await database.collection(COLLECTION_NAME).updateOne({ id: taskId, userId }, { $set: updatedStatus });

    // Respond with the updated task information
    res.json({ message: "Updated Status Successfully", updatedStatus });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete Note (only if it belongs to the authenticated user)
router.delete("/deleteTask", extractUserFromToken, async (req, res) => {
  try {
    const noteId = req.query.id;
    const userId = getUserId(req); // Make sure this returns 1
    console.log("Deleting note with ID:", noteId, "for user ID:", userId);
    const database = getDatabase();
    const deleteResult = await database
      .collection(COLLECTION_NAME)
      .deleteOne({ id: noteId, userId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    res.json("Deleted Successfully");
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
