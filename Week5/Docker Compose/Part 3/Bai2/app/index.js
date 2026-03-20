const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/mydb";

// Simple Note model
const Note = mongoose.model(
  "Note",
  new mongoose.Schema({ text: String, createdAt: { type: Date, default: Date.now } })
);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", async (_req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 }).limit(5);
  res.json({ message: "Node.js + MongoDB REST API", notes });
});

app.post("/notes", async (req, res) => {
  const note = await Note.create({ text: req.body.text || "Hello from Bai2!" });
  res.status(201).json(note);
});

app.listen(3000, () => console.log("Server running on port 3000"));
