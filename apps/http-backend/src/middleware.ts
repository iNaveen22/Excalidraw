import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import {JWT_SECRET} from "@repo/backend-common/config";
import { AuthJwtPayload } from "./types/jwt";

export function middleware(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1] ?? ""; // Bearer <token>

    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
    
    if(decoded){
        req.userId = decoded.userId;
        next();
    }else {
        res.json({
            message: "Unauthorized"
        })
    }
    
 
}