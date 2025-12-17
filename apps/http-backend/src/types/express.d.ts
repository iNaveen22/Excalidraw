import { AuthJwtPayload } from "./jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};