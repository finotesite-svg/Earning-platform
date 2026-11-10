const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/tickets", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Unable to load support tickets." });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Subject and message are required." });
    }
    const ticket = await SupportTicket.create({
      userId: req.user.userId,
      subject: subject.trim(),
      message: message.trim(),
    });
    res.status(201).json({ message: "Support ticket submitted.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Unable to submit support ticket." });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Unable to load notifications." });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: { isRead: true } },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Unable to update notification." });
  }
});

module.exports = router;
