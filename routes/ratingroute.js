const express = require("express");
const router = express.Router();
const {
  ratePost
} = require("../controller/ratecontroller");

const authMiddleware = require("../middleware/authmiddleware");


router.post("/ratePost", authMiddleware,ratePost);

module.exports = router;
