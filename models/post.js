const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

 
const Post = sequelize.define("post", {
    mediaUrl: {
        type: DataTypes.JSON,     // or DataTypes.TEXT if you stringify
        allowNull: true
      },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: false
});

module.exports = Post;
