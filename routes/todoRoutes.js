const express = require("express");
const multer = require("multer");
const uuid = require("uuid");
const { getDatabase } = require("../db");
const { COLLECTION_NAME } = require("../config");

const router = express.Router();
const upload = multer();

// Helper function to generate unique ID
function generateRandomId() {
  return uuid.v4();
}

// Get Notes
router.get("/GetNotes", async (req, res) => {
  try {
    const database = getDatabase();
    const result = await database.collection(COLLECTION_NAME).find({}).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Note
router.post("/AddNotes", upload.none(), async (req, res) => {
  try {
    const database = getDatabase();
    const newNotes = {
      id: generateRandomId(),
      description: req.body.newNotes,
    };
    await database.collection(COLLECTION_NAME).insertOne(newNotes);
    res.json({ message: "Added Successfully", newNotes });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Note
router.put("/UpdateNotes", upload.none(), async (req, res) => {
  try {
    const noteId = req.query.id;
    const database = getDatabase();
    const updatedNotes = {
      id: noteId,
      description: req.body.updatedNotes,
      type: "done",
    };
    const existingNote = await database.collection(COLLECTION_NAME).findOne({ id: noteId });

    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    await database.collection(COLLECTION_NAME).updateOne({ id: noteId }, { $set: updatedNotes });
    res.json({ message: "Updated Successfully", updatedNotes });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Note
router.delete("/DeleteNotes", async (req, res) => {
  try {
    const noteId = req.query.id;
    const database = getDatabase();
    await database.collection(COLLECTION_NAME).deleteOne({ id: noteId });
    res.json("Deleted Successfully");
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
