"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
// Define the base upload directory inside the public folder
const uploadDir = path_1.default.join(__dirname, "../../public/uploads");
fs_extra_1.default.ensureDirSync(uploadDir); // Ensure directory exists
// Multer Storage Configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let type = req.body.type || "general"; // Default type if not provided
        const destinationPath = path_1.default.join(uploadDir, type);
        fs_extra_1.default.ensureDirSync(destinationPath); // Ensure directory exists
        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        let identifier = req.body.identifier; // Username or Post ID
        let type = req.body.type || "general"; // "profile" or "post"
        if (!identifier) {
            return cb(new Error("Identifier (username or postId) is required"), "");
        }
        const filename = `${identifier}.png`; // Standardized filename
        cb(null, filename);
    },
});
// Initialize Multer
const upload = (0, multer_1.default)({ storage });
// ✅ Fix: Define upload middleware properly
exports.uploadImage = [
    upload.single("image"),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (error) {
            next(error);
        }
    }),
];
//# sourceMappingURL=upload_controller.js.map