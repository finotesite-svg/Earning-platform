const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const TaskSubmission = require("../models/TaskSubmission");
const authMiddleware = require("../middleware/authMiddleware");

// Get all active tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/submissions/mine", authMiddleware, async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("taskId status createdAt");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Unable to load task submissions." });
  }
});

// Submit a task
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { taskId, evidence } = req.body;
    if (!taskId || !evidence?.trim()) {
      return res.status(400).json({ message: "Task and evidence are required." });
    }
    const userId = req.user.userId;

    // Check if task exists
    const task = await Task.findOne({ _id: taskId, isActive: true });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const existingSubmission = await TaskSubmission.findOne({
      userId,
      taskId,
      status: { $in: ["Pending", "Approved"] },
    });
    if (existingSubmission) {
      return res.status(409).json({
        message: "You already have an active or approved submission for this task.",
      });
    }

    const submission = new TaskSubmission({
      userId,
      taskId,
      evidence: evidence.trim(),
      status: "Pending",
    });

    await submission.save();
    res
      .status(201)
      .json({ message: "Task submitted successfully, waiting for approval.", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
