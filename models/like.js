const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

 
const Like = sequelize.define("like", {}, {
  timestamps: false
});

module.exports = Like;
