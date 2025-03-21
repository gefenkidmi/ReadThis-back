import { Request, Response } from 'express';
import User from '../models/users_model';
import { OAuth2Client } from 'google-auth-library';
import authController from "./users_controller";

const client = new OAuth2Client();

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const email = payload?.email;
      const name = payload?.name;
      const picture = payload?.picture;
  
      if (!email) {
        res.status(401).send("Email missing from Google token");
        return;
      }
  
      let user = await User.findOne({ email });
  
      if (!user) {
        const username = name?.replace(/\s+/g, "").toLowerCase() || email.split("@")[0];
  
        user = await User.create({
          email,
          username,
          password: "google-auth",
          imageUrl: picture,
        });
      }
  
      const tokens = await authController.generateToken(user._id);
  
      res.status(200).send({
        _id: user._id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        ...tokens,
      });
    } catch (err) {
      res.status(500).send((err as Error).message);
    }
  };