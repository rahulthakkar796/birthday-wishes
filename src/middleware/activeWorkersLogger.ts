import { Request, Response, NextFunction } from "express";
import { getActiveWorkersCount } from "../services/wishServices";

export const logActiveWorkers = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const activeWorkers = getActiveWorkersCount();
  console.log(`Active workers: ${activeWorkers}`);
  next();
};
