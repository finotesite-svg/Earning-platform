const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key_here",
    );
    const user = await User.findById(decoded.userId).select("_id role isActive");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account is unavailable." });
    }
    req.user = { userId: user._id, role: user.role };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    next(error);
  }
};

module.exports = authMiddleware;
