const express = require("express");
const router = express.Router();
const {
  toggleLike
} = require("../controller/likecontoller");

const authMiddleware = require("../middleware/authmiddleware");


router.post("/addlike", authMiddleware,toggleLike);

module.exports = router;
