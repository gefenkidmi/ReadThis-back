import postModel, { IPost } from "../models/post_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import path from "path";
import fs from "fs";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    try {
      const { title, content } = req.body;
  
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
      });
  
      await newPost.save();
      res.status(201).json({ message: "Post created successfully.", post: newPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post." });
    }
  }
}

export default new PostsController();

