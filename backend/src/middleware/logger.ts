import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { logger } from "../utils/logger";

// Custom Morgan token for response time
morgan.token("response-time-ms", (req: any, res: any) => {
  if (!req._startTime) return "0";
  const ms = Date.now() - req._startTime;
  return ms.toString();
});

// Create Morgan logger middleware
export const morganMiddleware = morgan(
  `:method :url :status :response-time-ms ms - :res[content-length]`,
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }
);

// Attach start time to request object
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  (req as any)._startTime = Date.now();
  next();
}
