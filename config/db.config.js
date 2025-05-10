const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DB");
  } catch (err) {
    console.error("❌ Failed to connect:", err.message);
  }
})(); 


// sequelize.sync({ alter: true })  // or { force: true } for full reset (careful!)
//   .then(() => {
//     console.log("✅ All models synced successfully");
//   })
//   .catch((err) => {
//     console.error("❌ Failed to sync models:", err.message);
//   });


module.exports = {
  sequelize,
  Sequelize
};
