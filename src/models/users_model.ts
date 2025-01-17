import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  username: String;
  _id?: string;
  refreshToken?: string[];
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
  refreshToken: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
