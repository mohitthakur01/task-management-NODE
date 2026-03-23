import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/**
 * Protect routes – verifies JWT from Authorization header
 * Attaches the authenticated user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError("Not authorized, no token provided", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Not authorized, invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Not authorized, token expired", 401));
    }
    next(error);
  }
};

/**
 * Authorize by role – restricts access to specific roles
 * @param  {...string} roles - Allowed roles (e.g. "admin", "user")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

export { protect, authorize };
