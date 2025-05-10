const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Comment = sequelize.define("comment", {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parentCommentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false
  });



  
module.exports = Comment;