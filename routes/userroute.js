const express = require("express");
const multer     = require('multer');

const router = express.Router();
const {
  
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  signup,
} = require("../controller/usercontroller");


const authMiddleware = require("../middleware/authmiddleware");


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }  // 50 MB
  });
  

router.get("/getAllUsers",authMiddleware, getUsers);
router.post("/getUserById", authMiddleware,getUserById);
router.put("/updateUser", authMiddleware,upload.single('file'),updateUser);
router.delete("/deleteUser",authMiddleware, deleteUser);
router.post("/signup",upload.single('file'), signup);

router.post("/login", login);



module.exports = router;
