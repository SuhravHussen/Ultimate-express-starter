import { Request, Response } from "express";

export const getHome = (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Express TypeScript API",
    data: {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
};

export default {
  getHome,
};
