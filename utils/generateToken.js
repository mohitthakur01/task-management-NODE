import jwt from "jsonwebtoken";

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - The user document
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
