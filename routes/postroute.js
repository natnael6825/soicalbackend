// routes/post.routes.js
const express = require("express");
const multer  = require("multer");
const router  = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} = require("../controller/postcontroller");

const authMiddleware = require("../middleware/authmiddleware");


// 50MB limit, in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Now accept up to, say, 5 files under field name "files"
router.post("/createPost", authMiddleware,upload.array("file"), createPost);
router.get("/getAllPosts",authMiddleware, getAllPosts);
router.post("/getPostById",authMiddleware, getPostById);
router.put("/updatePost",authMiddleware, upload.array("file"), updatePost);
router.delete("/deletePost", authMiddleware,deletePost);

module.exports = router;
