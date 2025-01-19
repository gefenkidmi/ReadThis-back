import postModel, { IPost } from "../models/post_model";
import { Request, Response } from "express";
import { AuthRequest } from "../common/auth_middleware";
import BaseController from "./base_controller";
import path from "path";
import fs from "fs";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    try {
      const { title, content, owner } = req.body;

      if (!title || !content || !owner) {
        res
          .status(400)
          .json({ message: "Title, content, and owner are required." });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: "Post image is required." });
        return;
      }
      const targetDir = path.join(__dirname, "../uploads/posts");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const imageName = new Date().toISOString().replace(/[:.]/g, "-");
      const targetPath = path.join(targetDir, `${imageName}.png`);

      fs.renameSync(req.file.path, targetPath);

      const imageUrl = `/uploads/posts/${imageName}.png`;

      const newPost = new postModel({
        title,
        content,
        imageUrl,
        owner,
      });

      await newPost.save();

      res
        .status(201)
        .json({ message: "Post created successfully.", post: newPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post." });
    }
  }

  async like(req: AuthRequest, res: Response) {
    const postId = req.params.id;

    try {
      // בדיקה אם req.user מוגדר
      if (!req.user) {
        return res
          .status(401)
          .send({ message: "Unauthorized: User not logged in" });
      }

      const userId = req.user._id; // לאחר הבדיקה, TypeScript מבין שהמשתנה קיים

      // שליפת הפוסט לפי ID
      const requestedPost = await this.model
        .findById(postId)
        .select("usersWhoLiked");
      if (!requestedPost) {
        return res.status(404).send({ message: "Post not found" });
      }

      // בדיקה אם המשתמש כבר עשה לייק
      if (requestedPost.usersWhoLiked.find((id) => id.toString() === userId)) {
        return res
          .status(400)
          .send({ message: "User already liked this post" });
      }

      // הוספת המשתמש למערך הלייקים
      requestedPost.usersWhoLiked.push(userId);

      // שמירה
      await requestedPost.save();

      res.status(200).send(requestedPost);
    } catch (err: any) {
      console.error("Error in like function:", err);
      res.status(500).send({
        message: err.message || "An error occurred while liking the post",
      });
    }
  }

  async unlike(req: AuthRequest, res: Response) {
    const postId = req.params.id;

    try {
      // בדיקה אם req.user מוגדר
      if (!req.user) {
        return res
          .status(401)
          .send({ message: "Unauthorized: User not logged in" });
      }

      const userId = req.user._id;

      // שליפת הפוסט לפי ID
      const requestedPost = await this.model
        .findById(postId)
        .select("usersWhoLiked");
      if (!requestedPost) {
        return res.status(404).send({ message: "Post not found" });
      }

      // בדיקה אם המשתמש עשה לייק
      if (!requestedPost.usersWhoLiked.find((id) => id.toString() === userId)) {
        return res
          .status(400)
          .send({ message: "User has not liked this post" });
      }

      // הסרת המשתמש ממערך הלייקים
      requestedPost.usersWhoLiked = requestedPost.usersWhoLiked.filter(
        (id) => id.toString() !== userId
      );

      // שמירה
      await requestedPost.save();

      res.status(200).send(requestedPost);
    } catch (err: any) {
      console.error("Error in unlike function:", err);
      res.status(500).send({
        message: err.message || "An error occurred while unliking the post",
      });
    }
  }
}

export default new PostsController();

