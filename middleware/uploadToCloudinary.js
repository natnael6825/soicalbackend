// middleware/uploadProfilePicture.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name:    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:       process.env.CLOUDINARY_API_KEY,
  api_secret:    process.env.CLOUDINARY_API_SECRET,
});

// Multer: in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Middleware function
const uploadProfilePicture = [
  upload.single("profilePicture"), // Field name must match form-data
  async (req, res, next) => {
    try {
      if (!req.file) return next(); // no file uploaded

      const buffer = req.file.buffer;
      const fileStr = `data:application/octet-stream;base64,${buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(fileStr, {
        folder: "user_profiles",
        public_id: `${Date.now()}_${req.file.originalname.replace(/\..+$/, "")}`,
        resource_type: "auto",
      });

      req.profilePictureUrl = result.secure_url;
      next();
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Failed to upload profile picture" });
    }
  },
];

module.exports = uploadProfilePicture;
