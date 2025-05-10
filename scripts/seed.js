require("dotenv").config();
const db = require("../models");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    await db.sequelize.sync({ force: true });

    const password = await bcrypt.hash("123456", 10);
    const user = await db.User.create({
      username: "admin",
      email: "admin@example.com",
      password,
      role: "admin",
      bio: "Super user"
    });

    const post = await db.Post.create({
      caption: "Welcome to the platform!",
      mediaUrl: ["https://via.placeholder.com/300"],
      userId: user.id
    });

    await db.Comment.create({
      content: "This is the first comment!",
      postId: post.id,
      userId: user.id
    });

    await db.Like.create({ userId: user.id, postId: post.id });
    await db.Rating.create({ userId: user.id, postId: post.id, rating: 5 });

    console.log("✅ Seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
