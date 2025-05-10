// app.js
require("dotenv").config();
const express       = require("express");
const bodyParser    = require("body-parser");
const http          = require("http");
const { graphqlHTTP } = require("express-graphql");

// Kick off your multi-schema connections

// Import your REST routes
const userRoutes    = require("./routes/userroute");
const postRoutes    = require("./routes/postroute");
const commentRoutes = require("./routes/commentroute");
const likeRoutes    = require("./routes/likeroute");
const ratingRoutes  = require("./routes/ratingroute");
const { logToFile } = require("./utils/logger");


// Import your GraphQL schema
const graphQLSchema = require("./graphql/schema");

const app = express();

// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// REST endpoints
app.use("/api/users",    userRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes",    likeRoutes);
app.use("/api/ratings",  ratingRoutes);

// Health check
app.get("/", (req, res) => res.send("OK"));

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema:graphQLSchema,
    graphiql: true,
    context: { req },
    customFormatErrorFn: (err) => {
      logToFile(`GraphQL Error: ${err.message}`);
      return {
        message: err.message,
        path: err.path,
        locations: err.locations
      };
    }
  }))
);

// Start server
const PORT = process.env.PORT || 6050;
http.createServer(app).listen(PORT, () => {
  console.log(`🚀 REST API on http://localhost:${PORT}/api`);
  console.log(`📊 GraphQL on  http://localhost:${PORT}/graphql`);
});
