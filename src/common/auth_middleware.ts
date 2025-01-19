import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { _id: string };
}

/*
type Payload = {
  _id: string;
};
*/

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");

  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    res.status(401).send("Access Denied");
    return;
  }

  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("Server Error");
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(401).send("Access Denied");
      return;
    }

    req.user = user as { _id: string };
    next();
  });
};

export default authMiddleware;