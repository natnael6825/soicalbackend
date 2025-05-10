const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db.config");

const User = sequelize.define("user", {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user' // Default role is 'user'
  },
  session: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tokenExpiration: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: false
});

// Hash the password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10); // Hash the password
  }
});

module.exports = User;
