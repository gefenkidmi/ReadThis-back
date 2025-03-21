import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  username: String;
  _id?: string;
  refreshToken?: string[];
  imageUrl: string;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "../uploads/profile/testing.png"
  },
  refreshToken: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;
