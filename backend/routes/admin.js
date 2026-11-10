const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const TaskSubmission = require("../models/TaskSubmission");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const SystemSetting = require("../models/SystemSetting");
const SupportTicket = require("../models/SupportTicket");
const AuditLog = require("../models/AuditLog");
const LedgerEntry = require("../models/LedgerEntry");
const PaymentEvent = require("../models/PaymentEvent");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.use(authMiddleware, adminMiddleware);

router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      activeTasks,
      pendingWithdrawals,
      pendingWithdrawalCount,
      pendingSubmissionCount,
      recentSubmissions,
      recentWithdrawals,
    ] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments({ isActive: true }),
      WithdrawalRequest.aggregate([
        { $match: { status: "Pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      WithdrawalRequest.countDocuments({ status: "Pending" }),
      TaskSubmission.countDocuments({ status: "Pending" }),
      TaskSubmission.find({ status: "Pending" })
        .populate("userId", "name")
        .populate("taskId", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userId taskId createdAt"),
      WithdrawalRequest.find({ status: "Pending" })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userId amount createdAt"),
    ]);
    res.json({
      totalUsers,
      activeTasks,
      pendingPayouts: pendingWithdrawals[0]?.total || 0,
      pendingWithdrawalCount,
      pendingSubmissionCount,
      recentSubmissions,
      recentWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to load admin overview." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name phone role isActive balance createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Unable to load users." });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean." });
    }
    if (req.params.id === String(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "You cannot disable your own account." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive } },
      { new: true },
    ).select("name phone role isActive balance createdAt");
    if (!user) return res.status(404).json({ message: "User not found." });
    await AuditLog.create({
      adminId: req.user.userId,
      action: "user_status_change",
      targetType: "User",
      targetId: user._id,
      details: { isActive },
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Unable to update user status." });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const { title, description, instructions, reward, deadline, link } =
      req.body;
    const numericReward = Number(reward);
    if (
      !title?.trim() ||
      !Number.isFinite(numericReward) ||
      numericReward <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Task title and a positive reward are required." });
    }
    const task = await Task.create({
      title: title.trim(),
      description: (description || title).trim(),
      instructions: (instructions || description || title).trim(),
      reward: numericReward,
      deadline: deadline || undefined,
      link: link?.trim() || "",
    });
    await AuditLog.create({
      adminId: req.user.userId,
      action: "task_create",
      targetType: "Task",
      targetId: task._id,
      details: { title: task.title, reward: task.reward },
    });
    res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    res.status(500).json({ message: "Unable to create task." });
  }
});

router.put("/tasks/:id", async (req, res) => {
  try {
    const { title, description, instructions, reward, deadline, link, eligibilityRules } =
      req.body;
    const numericReward = reward !== undefined ? Number(reward) : undefined;
    if (
      (title !== undefined && !title?.trim()) ||
      (numericReward !== undefined &&
        (!Number.isFinite(numericReward) || numericReward <= 0))
    ) {
      return res.status(400).json({
        message: "Task title must be non-empty and reward must be positive.",
      });
    }
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (instructions !== undefined) updateFields.instructions = instructions.trim();
    if (numericReward !== undefined) updateFields.reward = numericReward;
    if (deadline !== undefined) updateFields.deadline = deadline;
    if (link !== undefined) updateFields.link = link?.trim() || "";
    if (eligibilityRules !== undefined) updateFields.eligibilityRules = eligibilityRules;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ message: "Task not found." });
    await AuditLog.create({
      adminId: req.user.userId,
      action: "task_update",
      targetType: "Task",
      targetId: task._id,
      details: updateFields,
    });
    res.json({ message: "Task updated successfully.", task });
  } catch (error) {
    res.status(500).json({ message: "Unable to update task." });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true },
    );
    if (!task) return res.status(404).json({ message: "Task not found." });
    await AuditLog.create({
      adminId: req.user.userId,
      action: "task_delete",
      targetType: "Task",
      targetId: task._id,
      details: { title: task.title },
    });
    res.json({ message: "Task deactivated successfully.", task });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete task." });
  }
});

router.get("/submissions", async (req, res) => {
  try {
    const submissions = await TaskSubmission.find()
      .populate("userId", "name phone")
      .populate("taskId", "title reward")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Unable to load submissions." });
  }
});

router.put("/submissions/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Approved or Rejected." });
    }
    const submission = await TaskSubmission.findOneAndUpdate(
      { _id: req.params.id, status: "Pending" },
      { $set: { status } },
      { new: true },
    );
    if (!submission) {
      const exists = await TaskSubmission.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Submission has already been reviewed."
          : "Submission not found.",
      });
    }

    const task = await Task.findById(submission.taskId);
    if (status === "Approved" && task) {
      await User.findByIdAndUpdate(submission.userId, {
        $inc: { balance: task.reward },
      });
      await LedgerEntry.create({
        userId: submission.userId,
        type: "task_reward",
        amount: task.reward,
        reference: { taskId: task._id, submissionId: submission._id },
      });
    }
    await AuditLog.create({
      adminId: req.user.userId,
      action: "submission_review",
      targetType: "TaskSubmission",
      targetId: submission._id,
      details: {
        status,
        taskId: submission.taskId,
        userId: submission.userId,
      },
    });
    await Notification.create({
      userId: submission.userId,
      title:
        status === "Approved"
          ? "Task submission approved"
          : "Task submission rejected",
      message: task
        ? `Your submission for "${task.title}" was ${status.toLowerCase()}.`
        : `Your task submission was ${status.toLowerCase()}.`,
    });
    res.json({
      message: `Submission ${status.toLowerCase()} successfully.`,
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to update submission." });
  }
});

router.get("/withdrawals", async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find()
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: "Unable to load withdrawals." });
  }
});

router.patch("/withdrawals/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Completed", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be Completed or Rejected." });
    }
    const withdrawal = await WithdrawalRequest.findOneAndUpdate(
      { _id: req.params.id, status: "Pending" },
      { $set: { status } },
      { new: true },
    );
    if (!withdrawal) {
      const exists = await WithdrawalRequest.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Withdrawal request has already been reviewed."
          : "Withdrawal request not found.",
      });
    }
    if (status === "Rejected") {
      const totalRefund = withdrawal.amount + (withdrawal.feeAmount || 0);
      await User.findByIdAndUpdate(withdrawal.userId, {
        $inc: { balance: totalRefund },
      });
      await LedgerEntry.create({
        userId: withdrawal.userId,
        type: "withdrawal_refund",
        amount: withdrawal.amount,
        reference: { withdrawalRequestId: withdrawal._id },
      });
      if (withdrawal.feeAmount > 0) {
        await LedgerEntry.create({
          userId: withdrawal.userId,
          type: "withdrawal_refund",
          amount: withdrawal.feeAmount,
          reference: { withdrawalRequestId: withdrawal._id, refundType: "fee" },
        });
      }
      await PaymentEvent.create({
        userId: withdrawal.userId,
        withdrawalRequestId: withdrawal._id,
        event: "refunded",
        amount: withdrawal.amount,
        metadata: { reason: "admin_rejection", feeRefunded: withdrawal.feeAmount },
      });
    } else {
      await PaymentEvent.create({
        userId: withdrawal.userId,
        withdrawalRequestId: withdrawal._id,
        event: "completed",
        amount: withdrawal.amount,
        metadata: {},
      });
    }
    await AuditLog.create({
      adminId: req.user.userId,
      action: "withdrawal_review",
      targetType: "WithdrawalRequest",
      targetId: withdrawal._id,
      details: { status, amount: withdrawal.amount, userId: withdrawal.userId },
    });
    await Notification.create({
      userId: withdrawal.userId,
      title:
        status === "Completed" ? "Withdrawal completed" : "Withdrawal rejected",
      message:
        status === "Completed"
          ? `Your ${withdrawal.amount.toFixed(2)} ETB withdrawal was completed.`
          : `Your ${withdrawal.amount.toFixed(2)} ETB withdrawal was rejected and refunded.`,
    });
    res.json({ message: `Withdrawal ${status.toLowerCase()}.`, withdrawal });
  } catch (error) {
    res.status(500).json({ message: "Unable to update withdrawal." });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      { key: "platform" },
      {
        $setOnInsert: {
          minWithdrawal: 200,
          referralBonus: 50,
          dailyBonus: 50,
          platformFee: 5,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Unable to load settings." });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const { minWithdrawal, referralBonus, dailyBonus, platformFee } = req.body;
    const settingsValues = [
      minWithdrawal,
      referralBonus,
      dailyBonus,
      platformFee,
    ].map(Number);
    if (
      settingsValues.some((value) => !Number.isFinite(value) || value < 0) ||
      settingsValues[3] > 100
    ) {
      return res
        .status(400)
        .json({
          message:
            "Settings must be non-negative; platform fee cannot exceed 100%.",
        });
    }
    const settings = await SystemSetting.findOneAndUpdate(
      { key: "platform" },
      {
        $set: {
          minWithdrawal: settingsValues[0],
          referralBonus: settingsValues[1],
          dailyBonus: settingsValues[2],
          platformFee: settingsValues[3],
        },
      },
      { new: true, upsert: true, runValidators: true },
    );
    await AuditLog.create({
      adminId: req.user.userId,
      action: "settings_update",
      targetType: "SystemSetting",
      targetId: settings._id,
      details: {
        minWithdrawal: settingsValues[0],
        referralBonus: settingsValues[1],
        dailyBonus: settingsValues[2],
        platformFee: settingsValues[3],
      },
    });
    res.json({ message: "Settings updated.", settings });
  } catch (error) {
    res.status(500).json({ message: "Unable to update settings." });
  }
});

router.get("/support/tickets", async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Unable to load support tickets." });
  }
});

router.patch("/support/tickets/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const statusMap = {
      open: "Pending",
      "in-progress": "In Progress",
      resolved: "Resolved",
    };
    if (!statusMap[status]) {
      return res.status(400).json({
        message: "Status must be one of: open, in-progress, resolved.",
      });
    }
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $set: { status: statusMap[status] } },
      { new: true },
    );
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }
    res.json({ message: "Ticket status updated.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Unable to update ticket status." });
  }
});

router.post("/support/tickets/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim()) {
      return res.status(400).json({ message: "Reply is required." });
    }
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $set: { adminReply: reply.trim() } },
      { new: true },
    );
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }
    await Notification.create({
      userId: ticket.userId,
      title: "Support ticket update",
      message: `Admin replied to your ticket: ${reply.trim().substring(0, 100)}${reply.length > 100 ? "..." : ""}`,
    });
    res.json({ message: "Reply sent successfully.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Unable to send reply." });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("adminId", "name phone")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Unable to load audit logs." });
  }
});

module.exports = router;
