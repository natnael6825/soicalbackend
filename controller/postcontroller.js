const db = require("../models");
const Post = db.Post;
const User = db.User;
const Like      = db.Like;
const Rating    = db.Rating;
const Comment = db.Comment;
const { uploadBuffer } = require('../service/cloudinaryservice');
const { Op, fn, col } = require("sequelize");



// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    const userId =req.user.id
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // 1) If files were uploaded, upload each to Cloudinary
    let mediaUrls = [];
    if (req.files && req.files.length) {
      const uploads = req.files.map(file =>
        uploadBuffer(file.buffer, file.originalname)
      );
      const results = await Promise.all(uploads);
      mediaUrls = results.map(r => r.secure_url);
    }

    // 2) Create the post, storing the array (ensure your model column is JSON or TEXT)
    const post = await Post.create({
      userId,
      caption,
      mediaUrl: mediaUrls   // or mediaUrls if you rename the column
    });

    res.status(201).json({
      message: "Post created successfully",
      data: post
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const posts = await Post.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        { model: Comment, as: "comments" }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Post ID is required" });

    // 1) Fetch post with its author and comments (you can include commenter data too)
    const post = await Post.findByPk(id, {
      include: [
        { model: User,    as: "user",     attributes: ["id", "username", "email"] },
        { model: Comment, as: "comments", include: [{ model: User, as: "user", attributes: ["id", "username"] }] }
      ]
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    // 2) Count likes
    const likeCount = await Like.count({ where: { postId: id } });

    // 3) Compute average rating (will be null if no ratings)
    const avgResult = await Rating.findOne({
      where: { postId: id },
      attributes: [[fn("AVG", col("rating")), "avgRating"]]
    });
    const avgRating = avgResult.get("avgRating") !== null
      ? parseFloat(avgResult.get("avgRating")).toFixed(2)
      : null;

    // 4) Return combined result
    res.json({
      post,
      likeCount,
      avgRating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { id, caption } = req.body;
    if (!id) return res.status(400).json({ error: "Post ID is required" });

    // 1) Handle new uploads if any
    let mediaUrls;
    if (req.files && req.files.length) {
      const uploads = req.files.map(file =>
        uploadBuffer(file.buffer, file.originalname)
      );
      const results = await Promise.all(uploads);
      mediaUrls = results.map(r => r.secure_url);
    }

    // 2) Prepare update data
    const data = {};
    if (caption !== undefined) data.caption = caption;
    if (mediaUrls) data.mediaUrl = mediaUrls;

    // 3) Perform update
    const [updated] = await Post.update(data, { where: { id } });
    if (!updated) return res.status(404).json({ error: "Post not found" });

    const updatedPost = await Post.findByPk(id);
    res.json({
      message: "Post updated successfully",
      data: updatedPost
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Post ID is required" });

    // Find the post to check if it exists
    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if the user is an admin or the post owner
    if (req.user.role !== 'admin' && post.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You can only delete your own post." });
    }

    // Delete associated comments, likes, and ratings for the post
    await Comment.destroy({ where: { postId: id } });
    await Like.destroy({ where: { postId: id } });
    await Rating.destroy({ where: { postId: id } });

    // Delete the post
    await post.destroy();

    res.json({ message: "Post and its associated data (comments, likes, ratings) deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};