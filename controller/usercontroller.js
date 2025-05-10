

// Create a new user
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = db.User;
const { Op } = require("sequelize");

const { uploadBuffer } = require('../service/cloudinaryservice');





// Signup a new user
exports.signup = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, and password are required" });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Email already in use" });

    let profilePicture;

    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {
      const { originalname, buffer } = req.file;
      const result = await uploadBuffer(buffer, originalname);
      profilePicture = result.secure_url; // Use the secure URL from Cloudinary
    }

    const user = await User.create({
      username,
      email,
      password,
      bio,
      profilePicture
    });

    res.status(201).json({
      message: "User created successfully",
      data: { username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Login a user and generate JWT token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // Generate JWT token with expiration time (e.g., 1 hour)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Store token and expiration in user record
    user.session = token;
    user.tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // Token expires in 1 hour
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user.id,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Middleware to check if the user is authenticated (valid token)
exports.verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    // Check if the token exists and has not expired
    if (!user || user.session !== token || new Date() > new Date(user.tokenExpiration)) {
      return res.status(403).json({ error: "Token is invalid or expired" });
    }

    req.userId = decoded.id;
    req.role = decoded.role;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    const users = await User.findAll({
      attributes: {
        exclude: ["password", "tokenExpiration", "session"]
      }
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get user by ID (via query param)
exports.getUserById = async (req, res) => {
  try {
    const { adminUserSearch } = req.body;
    const role=req.user.role
    const userId=req.user.id

    let searchId;

    if (role === "admin" && adminUserSearch) {
      searchId = adminUserSearch; // Admin can search any user
    } else {
      searchId = userId; // Default to self
    }

    const user = await User.findByPk(searchId, {
      attributes: {
        exclude: ["password", "tokenExpiration", "session"]
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update user info
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = { ...req.body };

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    // If a new profile picture is uploaded
    if (req.file) {
      const { originalname, buffer } = req.file;
      const result = await uploadBuffer(buffer, originalname);
      data.profilePicture = result.secure_url; // assuming this is the returned URL
    }

    const [updated] = await User.update(data, { where: { id: userId } });
    if (!updated) return res.status(404).json({ error: "User not found" });

    const updatedUser = await User.findByPk(userId);
    res.json({
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete user by ID (via body)
exports.deleteUser = async (req, res) => {
  try {
    const { deleteuserid } = req.body;
const role=req.user.role
    if (role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    if (!deleteuserid) return res.status(400).json({ error: "User ID is required" });

    const deleted = await User.destroy({ where: { id:deleteuserid } });
    if (!deleted) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
