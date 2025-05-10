const db = require("../models");
const Comment = db.Comment;
const User = db.User;
const Post = db.Post;

// Add a comment (or reply)
exports.addComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    const userId=req.user.id

    if (!content || !postId || !userId) {
      return res.status(400).json({
        error: "Required fields: content, postId, and userId"
      });
    }

    // If parentCommentId is provided, it's a reply to an existing comment
    const comment = await Comment.create({
      content,
      postId,
      userId,
      parentCommentId: parentCommentId || null  // null for root-level comments
    });

    res.status(201).json({
      message: "Comment added successfully",
      data: comment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all root-level comments and their replies for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ error: "postId query parameter is required" });
    }

    const comments = await Comment.findAll({
      where: { postId, parentCommentId: null },
      include: [
        { model: db.User, as: "user", attributes: ["id", "username", "email"] },
        {
          model: db.Comment,
          as: "replies",
          include: [{ model: db.User, as: "user", attributes: ["id", "username"] }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Comment ID is required" });

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Allow deletion by admin or the user who posted the comment
    if (req.user.role !== 'admin' && comment.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You can only delete your own comment." });
    }

    await comment.destroy();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

