import { Response } from "express";
import { AuthRequest } from "../common/auth_middleware";
import userModel, { IUser } from "../models/users_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Check if a user with the same email or username already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (!req.file) {
      res.status(400).json({ message: "Profile image is required." });
      return;
    }

    if (existingUser) {
      res.status(400).json({
        message: "Username or Email already exists. Please try a different one.",
      });
      return;
    }

    const targetDir = path.join(__dirname, "../uploads/profile");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, `${username}.png`);
    fs.renameSync(req.file.path, targetPath);
    const imageUrl = `/uploads/profile/${username}.png`;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = await userModel.create({
      email,
      username,
      password: hashedPassword,
      imageUrl,
    });

    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

type tTokens = {
  accessToken: string;
  refreshToken: string;
};

const generateToken = (userId: string): tTokens | null => {
  if (!process.env.TOKEN_SECRET) {
    return null;
  }
  const random = Math.random().toString();
  const accessToken = jwt.sign(
    { _id: userId, random },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { _id: userId, random },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );

  return { accessToken, refreshToken };
};

const login = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await userModel.findOne({ username });
    if (!user) {
      res.status(400).send("Wrong username or password");
      return;
    }

    // Check the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).send("Wrong username or password");
      return;
    }

    // Generate tokens
    const tokens = generateToken(user._id!);
    if (!tokens) {
      res.status(500).send("Server Error");
      return;
    }

    // Update refresh tokens
    user.refreshToken = [...(user.refreshToken || []), tokens.refreshToken];
    await user.save();

    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      res.status(400).send("Refresh token is required");
      return;
    }

    // Find the user and remove the refresh token
    const user = await userModel.findOne({ refreshToken });
    if (user) {
      user.refreshToken = user.refreshToken?.filter((token) => token !== refreshToken) || [];
      await user.save();
    }

    res.status(200).send("Success");
  } catch (err) {
    res.status(400).send(err);
  }
};

const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      res.status(400).send("Refresh token is required");
      return;
    }

    if (!process.env.TOKEN_SECRET) {
      res.status(500).send("Server Error");
      return;
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err, payload: any) => {
      if (err) {
        res.status(401).send("Invalid refresh token");
        return;
      }

      const userId = payload._id;
      const user = await userModel.findById(userId);
      if (!user || !user.refreshToken?.includes(refreshToken)) {
        res.status(401).send("Invalid refresh token");
        return;
      }

      // Generate new tokens
      const tokens = generateToken(user._id!);
      if (!tokens) {
        res.status(500).send("Server Error");
        return;
      }

      // Update refresh tokens
      user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      res.status(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        _id: user._id,
      });
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

export default {
  register,
  login,
  refresh,
  logout,
};