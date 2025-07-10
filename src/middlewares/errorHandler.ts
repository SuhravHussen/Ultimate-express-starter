import { Request, Response, NextFunction } from "express";
import logger from "@utils/logger";

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  // Log the error
  if (statusCode >= 500) {
    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${err.message}`,
    );
    logger.error(err.stack);
  } else {
    logger.warn(
      `[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${err.message}`,
    );
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    statusCode: 404,
    message: `Cannot ${req.method} ${req.path}`,
  });
};

export default { errorHandler, notFoundHandler };
