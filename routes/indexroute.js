const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./userroute");
const postRoutes = require("./postroute");
const commentRoutes = require("./commentroute");
const likeRoutes = require("./likeroute");
const ratingRoutes = require("./ratingroute");

// Mount them with base paths
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/ratings", ratingRoutes);

module.exports = router;
