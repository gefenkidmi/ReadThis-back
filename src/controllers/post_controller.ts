import postModel, { IPost } from "../models/post_model";
import { Request, Response } from "express";
import { AuthRequest } from "../common/auth_middleware";
import BaseController from "./base_controller";
import path from "path";
import fs from "fs";
import axios from "axios";
import sharp from "sharp";

interface GoogleBooksResponse {
  items?: {
    volumeInfo: {
      title?: string;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
    };
  }[];
}
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

      let imageUrl = "";
      const newPost = new postModel({
        title,
        content,
        owner,
      });

      await newPost.save();

      if (req.file) {
        const targetDir = path.join(__dirname, "../uploads/posts");
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const imageName = new Date().toISOString().replace(/[:.]/g, "-"); // change to post id
        const targetPath = path.join(targetDir, `${imageName}.png`);

        fs.renameSync(req.file.path, targetPath);
        imageUrl = `/uploads/posts/${imageName}.png`; // שמירת הנתיב של התמונה
      } else {
        newPost.imageUrl = await fetchBookCoverFromGoogleBooks(title, newPost._id.toString());
        await newPost.save();
      }

      newPost.imageUrl = imageUrl;

      res
        .status(201)
        .json({ message: "Post created successfully.", post: newPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post." });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    super.getAllPopulated(req, res, "owner comments.user", "username image");
  }

  async getById(req: AuthRequest, res: Response) {
    super.getByIdPopulated(req, res, "owner comments.user", "username image");
  }

  async like(req: AuthRequest, res: Response) {
    const postId = req.params.id;

    try {
      // בדיקה אם req.user מוגדר
      if (!req.user) {
        res.status(401).send({ message: "Unauthorized: User not logged in" });
        return;
      }

      const userId = req.user._id; // לאחר הבדיקה, TypeScript מבין שהמשתנה קיים

      // שליפת הפוסט לפי ID
      const requestedPost = await this.model
        .findById(postId)
        .select("usersWhoLiked");
      if (!requestedPost) {
        res.status(404).send({ message: "Post not found" });
        return;
      }

      // בדיקה אם המשתמש כבר עשה לייק
      if (requestedPost.usersWhoLiked.find((id) => id.toString() === userId)) {
        res.status(400).send({ message: "User already liked this post" });
        return;
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

  async unlike(req: AuthRequest, res: Response): Promise<void> {
    const postId = req.params.id;

    try {
      // בדיקה אם המשתמש מחובר
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized: User not logged in" });
        return;
      }

      const userId = req.user._id;

      // שליפת הפוסט לפי ID
      const post = await postModel.findById(postId).select("usersWhoLiked");
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      // בדיקה אם המשתמש עשה לייק
      const alreadyLiked = post.usersWhoLiked.some(
        (id) => id.toString() === userId
      );
      if (!alreadyLiked) {
        res.status(400).json({ message: "User has not liked this post" });
        return;
      }

      // הסרת המשתמש ממערך הלייקים
      post.usersWhoLiked = post.usersWhoLiked.filter(
        (id) => id.toString() !== userId
      );

      // שמירה של הפוסט המעודכן
      await post.save();

      res.status(200).json({ message: "Post unliked successfully", post });
    } catch (error: any) {
      console.error("Error in unlike function:", error);
      res.status(500).json({
        message: "An error occurred while unliking the post",
        error: error.message,
      });
    }
  }

  async addComment(req: AuthRequest, res: Response) {
    console.log(req);
    try {
      if (!req.body.text || !req.user) {
        res.status(400).json({ message: "Missing required fields." });
        return;
      }

      const postId = req.params.id;
      const comment = { text: req.body.text, user: req.user._id };

      // עדכון הפוסט עם הוספת התגובה
      const updatedPost = await this.model
        .findByIdAndUpdate(
          postId,
          { $push: { comments: comment } },
          { new: true }
        )
        .populate("comments.user", "username image"); // לוודא שהמשתמש נטען עם התגובה

      if (!updatedPost) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const newComment =
        updatedPost.comments?.[updatedPost.comments.length - 1] ?? null;

      if (!newComment) {
        res.status(500).json({ message: "Failed to retrieve new comment." });
        return;
      }

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment." });
    }
  }

  async getMyPosts(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send({ message: "Unauthorized" });
        return;
      }
      const posts = await postModel.find({ owner: req.user._id });
      res.status(200).json(posts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async updatePost(req: AuthRequest, res: Response): Promise<void> {
    console.log("update");
    const postId = req.params.id;

    try {
      if (!req.user) {
        res.status(401).send({ message: "Unauthorized" });
        return;
      }

      const post = await postModel
        .findOne({
          _id: postId,
          owner: req.user._id,
        })
        .populate("owner", "username image")
        .populate("comments.user", "username image");
      if (!post) {
        res.status(404).send({ message: "Post not found or unauthorized" });
        return;
      }

      const { title, content } = req.body;
      if (title) post.title = title;
      if (content) post.content = content;

      if (req.file) {
        if (post.imageUrl) {
          const oldImagePath = path.join(__dirname, "..", post.imageUrl);
          console.log("🔹 Trying to delete:", oldImagePath);
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log("✅ File deleted successfully");
            } else {
              console.log("⚠️ File not found:", oldImagePath);
            }
          } catch (error) {
            console.error("❌ Error deleting file:", error);
          }
        }

        const targetDir = path.join(__dirname, "../uploads/posts");
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const imageName = new Date().toISOString().replace(/[:.]/g, "-");
        const targetPath = path.join(targetDir, `${imageName}.png`);

        fs.renameSync(req.file.path, targetPath);
        post.imageUrl = `/uploads/posts/${imageName}.png`;
      }

      await post.save();
      res.status(200).json(post);
    } catch (err: any) {
      res.status(500).send({ message: err.message });
    }
  }
}


async function fetchBookCoverFromGoogleBooks(title: string, postId: string): Promise<string> {
  const query = encodeURIComponent(`${title}`);
  const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
  const openLibraryUrl = `https://openlibrary.org/search.json?title=${query}`;

  try {
    // Try Google Books API first
    const googleResponse = await axios.get(googleApiUrl);
    const googleData = googleResponse.data as GoogleBooksResponse;

    if (googleData.items && googleData.items.length > 0) {
      const book = googleData.items[0].volumeInfo;
      const imageUrl = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || getRandomImage();
      // const imageUrl = book.imageLinks?.thumbnail || getRandomImage();
      return await saveImageFromUrl(imageUrl, postId);
    }
  } catch (error: any) {
    console.error("Google Books API failed. Trying Open Library API...");
  }

  try {
    // Fallback: Try Open Library API
    const openLibraryResponse = await axios.get(openLibraryUrl);
    const openLibraryData = openLibraryResponse.data;

    if (openLibraryData.docs && openLibraryData.docs.length > 0) {
      const coverId = openLibraryData.docs[0].cover_i;
      if (coverId) {
        const imageUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        return await saveImageFromUrl(imageUrl, postId);
      }
    }
  } catch (error: any) {
    console.error("Open Library API also failed.");
  }

  console.log("Both APIs failed. Using fallback image.");
  return getRandomImage();
}

// Function to download and save image
async function saveImageFromUrl(imageUrl: string, postId: string): Promise<string> {
  try {
    if (!imageUrl.startsWith("http")) {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }
    
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const targetDir = path.join(__dirname, "../uploads/posts"); // Ensure correct path

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const imagePath = path.join(targetDir, `${postId}.png`);

    // Resize and optimize image using sharp
    await sharp(Buffer.from(response.data))
      .resize(500, 750, { fit: "cover" }) // Resize to 500x750px while maintaining aspect ratio
      .jpeg({ quality: 80 }) // Convert to JPEG and reduce quality to 80%
      .toFile(imagePath);

    console.log(`Image optimized and saved at: ${imagePath}`);
    return `/uploads/posts/${postId}.png`;
  } catch (error) {
    console.error("Error saving image:", error);
    return getRandomImage(); // Return a fallback image if saving fails
  }
}

function getRandomImage(): string {
  return "/uploads/posts/DefaultBook.png"; // Path to your stored default image
}

export default new PostsController();
