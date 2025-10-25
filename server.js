require("dotenv").config();
const app = require("./app");
const config = require("./config/config");
const backgroundJobService = require("./services/backgroundJobService");

const port = config.port;

// Start server
app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }
  console.log(`Server is listening on ${port}`);

  // Start background jobs for cache updates
  backgroundJobService.start({
    cacheUpdateInterval: 5 * 60 * 1000, // Update cache every 5 minutes
    cacheCleanupInterval: 10 * 60 * 1000, // Cleanup every 10 minutes
    articleCleanupInterval: 60 * 60 * 1000, // Cleanup articles every hour
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  backgroundJobService.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  backgroundJobService.stop();
  process.exit(0);
});
