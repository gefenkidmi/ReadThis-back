import mongoose, { PopulatedDoc } from "mongoose";
import { IUser } from "./users_model";

export interface IPost {
  title: string;
  content: string;
  owner: PopulatedDoc<IUser>;
  imageUrl: string;
  usersWhoLiked: string[];
  comments?: { user: PopulatedDoc<IUser>; text: string }[];
}

const postSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  content: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  imageUrl: {
    type: String,
  },
  usersWhoLiked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
    },
  ],
});

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;
