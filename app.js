require("dotenv").config();
const express = require("express");

const bodyParser = require("body-parser");
const http = require("http");


const   testAllConnections  = require("./config/db.config");


// Import your routes
const userRoutes    = require("./routes/userroute");
const postRoutes    = require("./routes/postroute");
const commentRoutes = require("./routes/commentroute");
const likeRoutes    = require("./routes/likeroute");
const ratingRoutes  = require("./routes/ratingroute");

const app    = express();



// Test DB connections (multi-schema)


app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));



// Mount routes under /api
app.use("/api/users",    userRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes",    likeRoutes);
app.use("/api/ratings",  ratingRoutes);

// Simple health check
app.get("/", (req, res) => res.send("OK"));

// Launch
const PORT = process.env.PORT || 6050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
