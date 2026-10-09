const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// Verify JWT Token & Enforce Active Status
// ==========================================
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access Denied: No authorization token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    console.error("[Auth] JWT_SECRET not configured");
    return res.status(500).json({
      message: "Server configuration error"
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Verify current user status in database (block check & approval check)
    const userDoc = await User.findById(verified.id).select("-password");

    if (!userDoc) {
      return res.status(401).json({
        message: "User account no longer exists"
      });
    }

    if (userDoc.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by the administrator."
      });
    }

    if (userDoc.role === "examiner" && userDoc.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your examiner account is pending approval by the administrator."
      });
    }

    if (userDoc.role === "examiner" && userDoc.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your examiner account request was rejected by the administrator."
      });
    }

    // Attach full up-to-date user info to req.user
    req.user = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      approvalStatus: userDoc.approvalStatus,
      isBlocked: userDoc.isBlocked
    };

    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired"
      });
    }

    return res.status(401).json({
      message: "Invalid or malformed token"
    });
  }
};

// ==========================================
// Role Authorization Middleware
// ==========================================
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Access Denied: Authentication required"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Only ${allowedRoles.join(" or ")}s can access this resource.`
      });
    }

    next();
  };
};

const adminOnly = requireRole("admin");

module.exports = {
  verifyToken,
  requireRole,
  authorizeRole: requireRole,
  adminOnly
};