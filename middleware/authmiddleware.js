// /middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

module.exports = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (
      !user ||
      user.session !== token ||
      new Date() > new Date(user.tokenExpiration)
    ) {
      return res.status(403).json({ error: "Token is invalid or expired" });
    }

    // ✅ Use req.user instead of req.body
    req.user = {
      id: decoded.id,
      role: decoded.role
    };


    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};
