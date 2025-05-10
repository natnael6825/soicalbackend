const db = require("../models");
const Rating = db.Rating;

exports.ratePost = async (req, res) => {
  const { postId, rating } = req.body;

const userId=req.user.id


  const [record, created] = await Rating.findOrCreate({
    where: { userId, postId },
    defaults: { rating }
  });

  if (!created) {
    record.rating = rating;
    await record.save();
  }

  res.json({ message: "Rating saved", rating: record.rating });
};
