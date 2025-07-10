import app from "./app";
import env from "./config/env";
import logger from "./utils/logger";

const startServer = async () => {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info(
        `Server running on ${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`,
      );
      logger.info("Press CTRL+C to stop the server");
    });

    // Only attach event handlers if server has .on method (standard Express)
    if (server && typeof server.on === "function") {
      // Handle server errors
      server.on("error", (error: Error) => {
        logger.error("Server error:", error);
        process.exit(1);
      });
    }

    // Handle unhandled rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully");
      if (server && typeof server.close === "function") {
        server.close(() => {
          logger.info("Process terminated");
          process.exit(0);
        });
      } else {
        logger.info("Process terminated");
        process.exit(0);
      }
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
