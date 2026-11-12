const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const demoUsers = [
  {
    name: "Demo Admin",
    phone: "+251900000000",
    password: "AdminDemo123!",
    role: "admin",
    balance: 0,
    referralCode: "EPDEMOADMIN",
  },
  {
    name: "Demo User",
    phone: "+251911111111",
    password: "UserDemo123!",
    role: "user",
    balance: 50,
    referralCode: "EPDEMOUSER",
  },
];

async function seedDemoUsers() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/earning_platform";

  await mongoose.connect(mongoUri, { dbName: "earning_platform" });

  for (const demoUser of demoUsers) {
    const password = await bcrypt.hash(demoUser.password, 10);
    await User.findOneAndUpdate(
      { phone: demoUser.phone },
      {
        $set: {
          name: demoUser.name,
          password,
          role: demoUser.role,
          balance: demoUser.balance,
          isActive: true,
          isVerified: true,
          referralCode: demoUser.referralCode,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`Seeded ${demoUser.role}: ${demoUser.phone}`);
  }
}

seedDemoUsers()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error("Unable to seed demo users:", error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
