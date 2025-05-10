const { sequelize } = require("../config/db.config");

// Import all models
const User    = require("./user");
const Post    = require("./post");
const Comment = require("./comment");
const Like    = require("./like");
const Rating  = require("./rating");

// Setup associations
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

Comment.hasMany(Comment, { foreignKey: "parentCommentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentCommentId", as: "parent" });

User.belongsToMany(Post, { through: Like, as: "likedPosts", foreignKey: "userId" });
Post.belongsToMany(User, { through: Like, as: "likers", foreignKey: "postId" });

User.belongsToMany(Post, { through: Rating, as: "ratedPosts", foreignKey: "userId" });
Post.belongsToMany(User, { through: Rating, as: "raters", foreignKey: "postId" });

// Optionally sync schema (call this once in app.js or migration setup)

// sequelize.sync({ force: true })  // or { force: true } for full reset
//   .then(() => console.log("✅ Database synced"))
//   .catch(err => console.error("❌ Sync error:", err.message));

// Export everything
module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Rating
};
