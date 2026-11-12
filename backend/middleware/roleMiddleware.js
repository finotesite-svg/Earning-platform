const authorizeRoles = (...allowedRoles) => {
  if (allowedRoles.length === 0) {
    throw new Error("At least one role is required for authorization.");
  }

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
