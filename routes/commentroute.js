const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByPost,
  deleteComment
} = require("../controller/commentcontroller");

const authMiddleware = require("../middleware/authmiddleware");


router.post("/addComment",authMiddleware,addComment);
router.post("/getCommentsByPost",authMiddleware, getCommentsByPost);
router.delete("/deleteComment", authMiddleware,deleteComment);

module.exports = router;
