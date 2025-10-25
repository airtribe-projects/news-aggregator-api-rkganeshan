require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "News Aggregator API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes (v1)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/news", newsRoutes);

// 404 Handler - must come before error handler
app.use(notFoundHandler);

// Global Error handling middleware - must be last
app.use(errorHandler);

module.exports = app;
