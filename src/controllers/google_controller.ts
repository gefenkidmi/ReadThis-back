import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/users_model"; // Import your User model

export const googleAuthRedirect = async (req: Request, res: Response) => {
  try {
    const { user, token } = req.user as any;

    // Send token and user info to frontend
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&name=${user.name}&email=${user.email}&picture=${user.picture}`);
  } catch (error) {
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};