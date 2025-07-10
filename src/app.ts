import express from "express";
import helmet from "helmet";
import cors from "cors";
import ultimateExpress from "ultimate-express";
import routes from "@routes/index";
import { errorHandler, notFoundHandler } from "@middlewares/errorHandler";
import requestLogger from "@middlewares/requestLogger";
import env from "@config/env";

class App {
  public app: any; // Use 'any' type to bypass strict type checking

  constructor() {
    // If using ultimate-express
    if (process.env.USE_ULTIMATE_EXPRESS === "true") {
      console.log("Using ultimate-express");
      this.app = ultimateExpress();
    } else {
      this.app = express();
    }

    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        optionsSuccessStatus: 200,
      }),
    );

    // Request logging
    this.app.use(requestLogger);
  }

  private configureRoutes(): void {
    this.app.use(routes);
  }

  private configureErrorHandling(): void {
    // Handle 404
    this.app.use(notFoundHandler);

    // Handle errors
    this.app.use(errorHandler);
  }
}

export default new App().app;
