import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 5000);
const dataFile = path.resolve("server-data.json");
const jwtSecret = process.env.JWT_SECRET || "local-development-secret-change-me";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const initialData = {
  users: [
    {
      id: 1,
      name: "Admin",
      phone: "+251900000000",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      balance: 0,
      referralCode: "REFADMIN",
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Join Official Telegram Channel",
      description: "Join our main Telegram channel to receive updates.",
      reward: 50,
      link: "https://telegram.org",
      status: "pending",
    },
  ],
  submissions: [],
  withdrawals: [],
  resetCodes: {},
};

function loadData() {
  if (!fs.existsSync(dataFile)) return structuredClone(initialData);
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return structuredClone(initialData);
  }
}

let data = loadData();

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function signToken(user) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ sub: user.id, role: user.role, exp: Date.now() + 7 * 86400000 }),
  );
  const signature = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  const parts = token?.split(".");
  if (parts?.length !== 3) return null;
  const signature = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(parts[2]))) return null;
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  return payload.exp > Date.now() ? payload : null;
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Authentication required." });
  const user = data.users.find((item) => item.id === payload.sub);
  if (!user) return res.status(401).json({ message: "Authentication required." });
  req.user = user;
  next();
}

function publicUser(user) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  return phone.startsWith("+") ? `+${digits}` : `+251${digits}`;
}

app.post("/api/auth/register", (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone || "");
  const password = String(req.body.password || "");
  if (name.length < 2 || phone.length < 12 || password.length < 6) {
    return res.status(400).json({ message: "Enter a valid name, phone, and 6-character password." });
  }
  if (data.users.some((user) => user.phone === phone)) {
    return res.status(409).json({ message: "A user with this phone number already exists." });
  }

  const user = {
    id: nextId(data.users),
    name,
    phone,
    passwordHash: hashPassword(password),
    role: "user",
    balance: 0,
    referralCode: `REF${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
  };
  data.users.push(user);
  saveData();
  return res.status(201).json({ user: publicUser(user), token: signToken(user) });
});

app.post("/api/auth/login", (req, res) => {
  const phone = normalizePhone(req.body.phone || "");
  const password = String(req.body.password || "");
  const user = data.users.find((item) => item.phone === phone);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid phone number or password." });
  }
  return res.json({ user: publicUser(user), token: signToken(user) });
});

app.get("/api/users/me", auth, (req, res) => {
  res.json(publicUser(req.user));
});

app.patch("/api/users/me", auth, (req, res) => {
  const name = String(req.body.name || req.user.name).trim();
  const phone = normalizePhone(req.body.phone || req.user.phone);
  if (name.length < 2) return res.status(400).json({ message: "Name is required." });
  if (data.users.some((user) => user.id !== req.user.id && user.phone === phone)) {
    return res.status(409).json({ message: "This phone number is already in use." });
  }
  req.user.name = name;
  req.user.phone = phone;
  saveData();
  res.json({ user: publicUser(req.user) });
});

app.patch("/api/users/me/password", auth, (req, res) => {
  if (!verifyPassword(String(req.body.currentPassword || ""), req.user.passwordHash)) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }
  const newPassword = String(req.body.newPassword || "");
  if (newPassword.length < 6) return res.status(400).json({ message: "Use at least 6 characters." });
  req.user.passwordHash = hashPassword(newPassword);
  saveData();
  res.json({ message: "Password updated." });
});

app.post("/api/auth/password-reset/request", (req, res) => {
  const phone = normalizePhone(req.body.phone || "");
  if (data.users.some((user) => user.phone === phone)) {
    data.resetCodes[phone] = String(Math.floor(100000 + Math.random() * 900000));
    saveData();
  }
  res.json({ message: "If the account exists, a reset code was sent." });
});

app.post("/api/auth/password-reset/confirm", (req, res) => {
  const phone = normalizePhone(req.body.phone || "");
  const code = String(req.body.code || "");
  const password = String(req.body.newPassword || "");
  const user = data.users.find((item) => item.phone === phone);
  if (!user || data.resetCodes[phone] !== code) {
    return res.status(400).json({ message: "Invalid reset code." });
  }
  if (password.length < 6) return res.status(400).json({ message: "Use at least 6 characters." });
  user.passwordHash = hashPassword(password);
  delete data.resetCodes[phone];
  saveData();
  res.json({ message: "Password updated." });
});

app.post("/api/auth/verify", (_req, res) => {
  res.json({ message: "Verified." });
});

app.get("/api/tasks", auth, (_req, res) => {
  const submissions = data.submissions.filter((item) => item.userId === _req.user.id);
  const tasks = data.tasks.map((task) => {
    const submission = submissions.find((item) => item.taskId === task.id);
    return { ...task, status: submission?.status || task.status };
  });
  res.json({ tasks });
});

app.post("/api/tasks", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  const task = {
    id: nextId(data.tasks),
    title: String(req.body.title || "").trim(),
    description: String(req.body.description || ""),
    reward: Number(req.body.reward),
    link: String(req.body.link || "#"),
    status: "pending",
  };
  if (!task.title || !Number.isFinite(task.reward) || task.reward <= 0) {
    return res.status(400).json({ message: "Enter a title and positive reward." });
  }
  data.tasks.push(task);
  saveData();
  res.status(201).json({ task });
});

app.delete("/api/tasks/:id", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  data.tasks = data.tasks.filter((task) => task.id !== Number(req.params.id));
  saveData();
  res.json({ message: "Task deleted." });
});

app.post("/api/tasks/:id/submissions", auth, (req, res) => {
  const taskId = Number(req.params.id);
  const evidence = String(req.body.evidence || "").trim();
  const task = data.tasks.find((item) => item.id === taskId);
  if (!task) return res.status(404).json({ message: "Task not found." });
  if (!evidence) return res.status(400).json({ message: "Proof is required." });
  const existing = data.submissions.find((item) => item.taskId === taskId && item.userId === req.user.id);
  if (existing) return res.status(409).json({ message: "This task was already submitted." });
  const submission = {
    id: nextId(data.submissions),
    taskId,
    userId: req.user.id,
    evidence,
    status: "pending_review",
  };
  data.submissions.push(submission);
  saveData();
  res.status(201).json({ submission });
});

app.post("/api/withdrawals", auth, (req, res) => {
  const amount = Number(req.body.amount);
  const method = String(req.body.method || "");
  const account = String(req.body.account || "").trim();
  if (!Number.isFinite(amount) || amount <= 0 || !account) {
    return res.status(400).json({ message: "Enter a valid withdrawal amount and account." });
  }
  if (amount > req.user.balance) return res.status(400).json({ message: "Insufficient balance." });
  const withdrawal = {
    id: nextId(data.withdrawals),
    userId: req.user.id,
    user: req.user.name,
    phone: req.user.phone,
    amount,
    method: method === "telebirr" ? "Telebirr" : "Bank Transfer",
    account,
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
  };
  data.withdrawals.push(withdrawal);
  saveData();
  res.status(201).json({ withdrawal });
});

app.get("/api/withdrawals/me", auth, (req, res) => {
  res.json({ withdrawals: data.withdrawals.filter((item) => item.userId === req.user.id) });
});

app.get("/api/withdrawals", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  res.json({ withdrawals: data.withdrawals });
});

app.patch("/api/withdrawals/:id", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  const withdrawal = data.withdrawals.find((item) => item.id === Number(req.params.id));
  if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found." });
  const status = req.body.status;
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  const oldStatus = withdrawal.status;
  const user = data.users.find((item) => item.id === withdrawal.userId);
  if (oldStatus === "Pending" && status === "Approved") {
    user.balance = Math.max(0, user.balance - withdrawal.amount);
  }
  withdrawal.status = status;
  saveData();
  res.json({ withdrawal });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
