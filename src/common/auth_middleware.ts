import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/users_model";
export interface AuthRequest extends Request {
  user?: IUser;
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

  jwt.verify(token, process.env.TOKEN_SECRET!, (err, decoded) => {
    if (err || !decoded) {
      console.log(err);
      res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
      return;
    }
  
    // Ensure decoded is treated as a JWT payload
    const userPayload = decoded as jwt.JwtPayload;
  
    req.user = {
      _id: userPayload._id as string,  // Ensure _id is a string
      email: userPayload.email as string,
      username: userPayload.username as string,
      imageUrl: userPayload.imageUrl as string,
      password: "", // Optional: Use an empty string or remove if not needed
    } as IUser;
  
    next();
  });
};

export default authMiddleware;
