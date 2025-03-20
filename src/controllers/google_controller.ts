import { Request, Response } from 'express';
import User from '../models/users_model';
import { OAuth2Client } from 'google-auth-library';
import authController from "./users_controller";
import { AuthRequest } from "../common/auth_middleware";

const client = new OAuth2Client();

export const googleSignIn = async (req: Request | AuthRequest, res: Response): Promise<void> => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        if (email) {
            let user = await User.findOne({ 'email': email });
            if (!user) {
                // create user in db if it doesn't already exist
                user = await User.create(
                    {
                        'email': email,
                        'name': email,
                        'password': email + process.env.GOOGLE_CLIENT_ID,
                        'image': payload?.picture
                    });
            }
            const tokens = await authController.generateToken(user._id);
            res.status(200).send(
                {
                    email: user.email,
                    _id: user._id,
                    image: user.imageUrl,
                    ...tokens
                })
        } else {
            res.status(401).send("email or password incorrect");
        }
    } catch (err) {
        res.status(400).send((err as Error).message);
    }

}