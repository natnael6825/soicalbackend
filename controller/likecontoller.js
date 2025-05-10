const db = require("../models");
const Like = db.Like;

exports.toggleLike = async (req, res) => {
  const {  postId } = req.body;

  const userId=req.user.id



  const existing = await Like.findOne({ where: { userId, postId } });
  if (existing) {
    await existing.destroy();
    return res.json({ message: "Post unliked" });
  }
  await Like.create({ userId, postId });
  res.json({ message: "Post liked" });
};
