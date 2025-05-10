const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

 
const Rating = sequelize.define("rating", {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  }
}, {
  timestamps: false
});

module.exports = Rating;
