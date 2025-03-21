import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";

const uploadDir = path.join(__dirname, "../../public/uploads");
fs.ensureDirSync(uploadDir); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type = req.body.type || "general"; 
    const destinationPath = path.join(uploadDir, type);

    fs.ensureDirSync(destinationPath); 
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    let identifier = req.body.identifier;
    let type = req.body.type || "general"; 

    if (!identifier) {
      return cb(new Error("Identifier (username or postId) is required"), "");
    }

    const filename = `${identifier}.png`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

export const uploadImage = [
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded!" });
        return;
      }

      const { type, identifier } = req.body;
      if (!type || !identifier) {
        res.status(400).json({ message: "Type and identifier are required." });
        return;
      }

      const imagePath = `/uploads/${type}/${identifier}.png`;

      res.status(200).json({
        message: "File uploaded successfully!",
        imagePath,
      });

      return;
    } catch (error) {
      next(error);
    }
  },
];