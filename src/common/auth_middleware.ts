import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
  user?: { _id: string };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("Authorization");
  if (!authorization) {
    console.log(" No token provided");
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authorization.split(" ")[1]; // חילוץ ה-token
  console.log(token);
  if (!token) {
    console.log("invalid token");
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET!, (err, user) => {
    if (err) {
      console.log(err);
      res
        .status(401)
        .json({ message: "Unauthorized: Token expired or invalid" });
      return;
    }
    req.user = user as { _id: string }; // הוספת המשתמש ל-request
    next();
  });
};

export default authMiddleware;
