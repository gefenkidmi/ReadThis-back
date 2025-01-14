import { Request, Response } from "express";
import userModel from "../models/users_model";

// Ensure correct function signature for Express request handler
const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "No token provided" });
      return;
    }

    // Verify Google Token
    const decodedToken = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
      .then((res) => res.json());

    if (!decodedToken.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    // Check if user exists
    let user = await userModel.findOne({ email: decodedToken.email });

    if (!user) {
      user = await userModel.create({
        email: decodedToken.email,
        password: "", // No password for Google users
      });
    }

    res.status(200).json({ message: "Google login successful", user });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Ensure default export
export default {
  googleLogin,
};