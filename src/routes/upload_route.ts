import { Router } from "express";
import { uploadImage } from "../controllers/upload_controller";

const router = Router();

// ✅ Use spread operator to correctly apply middleware
router.post("/upload", uploadImage);

export default router;