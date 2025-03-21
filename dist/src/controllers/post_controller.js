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
const post_model_1 = __importDefault(require("../models/post_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
class PostsController extends base_controller_1.default {
    constructor() {
        super(post_model_1.default);
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, content, owner } = req.body;
                if (!title || !content || !owner) {
                    res
                        .status(400)
                        .json({ message: "Title, content, and owner are required." });
                    return;
                }
                let imageUrl = "";
                const newPost = new post_model_1.default({
                    title,
                    content,
                    owner,
                });
                yield newPost.save();
                if (req.file) {
                    const targetDir = path_1.default.join(__dirname, "../uploads/posts");
                    if (!fs_1.default.existsSync(targetDir)) {
                        fs_1.default.mkdirSync(targetDir, { recursive: true });
                    }
                    const imageName = newPost._id.toString(); // change to post id
                    const targetPath = path_1.default.join(targetDir, `${imageName}.png`);
                    fs_1.default.renameSync(req.file.path, targetPath);
                    imageUrl = `/uploads/posts/${imageName}.png`; // שמירת הנתיב של התמונה
                    newPost.imageUrl = imageUrl;
                    yield newPost.save();
                }
                else {
                    newPost.imageUrl = yield fetchBookCoverFromGoogleBooks(title, newPost._id.toString());
                    yield newPost.save();
                }
                res
                    .status(201)
                    .json({ message: "Post created successfully.", post: newPost });
            }
            catch (error) {
                console.error("Error creating post:", error);
                res.status(500).json({ message: "Failed to create post." });
            }
        });
    }
    deletePost(req, res) {
        const _super = Object.create(null, {
            deleteItem: { get: () => super.deleteItem }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.id;
            try {
                if (!req.user) {
                    res.status(401).send({ message: "Unauthorized" });
                    return;
                }
                // חיפוש הפוסט כדי לקבל את הנתיב של התמונה
                const post = yield this.model.findOne({
                    _id: postId,
                    owner: req.user._id,
                });
                if (!post) {
                    res.status(404).send({ message: "Post not found or unauthorized" });
                    return;
                }
                // מחיקת התמונה מהשרת אם קיימת
                if (post.imageUrl) {
                    const imagePath = path_1.default.join(__dirname, "..", post.imageUrl);
                    console.log("🔹 Deleting image:", imagePath);
                    try {
                        if (fs_1.default.existsSync(imagePath)) {
                            fs_1.default.unlinkSync(imagePath);
                            console.log("✅ Image deleted successfully");
                        }
                        else {
                            console.log("⚠️ Image not found:", imagePath);
                        }
                    }
                    catch (error) {
                        console.error("❌ Error deleting image:", error);
                    }
                }
                // קריאה לפעולת המחיקה הכללית מה-BaseController
                yield _super.deleteItem.call(this, req, res);
            }
            catch (err) {
                console.error("Error deleting post:", err);
                res.status(500).send({ message: err.message });
            }
        });
    }
    getAllPaged(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const skip = (page - 1) * limit;
                const posts = yield this.model
                    .find()
                    .sort({ createdAt: -1 }) // הצגת הפוסטים מהחדש לישן
                    .skip(skip)
                    .limit(limit)
                    .populate("owner", "username image")
                    .populate("comments.user", "username image");
                const totalPosts = yield this.model.countDocuments();
                const totalPages = Math.ceil(totalPosts / limit);
                res.json({ posts, totalPages });
            }
            catch (err) {
                console.error("Error fetching paged posts:", err);
                res.status(500).json({ message: "Failed to fetch posts" });
            }
        });
    }
    getAll(req, res) {
        const _super = Object.create(null, {
            getAllPopulated: { get: () => super.getAllPopulated }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.getAllPopulated.call(this, req, res, "owner comments.user", "username image");
        });
    }
    getById(req, res) {
        const _super = Object.create(null, {
            getByIdPopulated: { get: () => super.getByIdPopulated }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.getByIdPopulated.call(this, req, res, "owner comments.user", "username image");
        });
    }
    like(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.id;
            try {
                // בדיקה אם req.user מוגדר
                if (!req.user) {
                    res.status(401).send({ message: "Unauthorized: User not logged in" });
                    return;
                }
                const userId = req.user._id; // לאחר הבדיקה, TypeScript מבין שהמשתנה קיים
                // שליפת הפוסט לפי ID
                const requestedPost = yield this.model
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
                if (userId) {
                    requestedPost.usersWhoLiked.push(userId);
                }
                else {
                    console.error("Error: userId is undefined");
                    res.status(400).json({ message: "Invalid user ID" });
                    return;
                }
                // שמירה
                yield requestedPost.save();
                res.status(200).send(requestedPost);
            }
            catch (err) {
                console.error("Error in like function:", err);
                res.status(500).send({
                    message: err.message || "An error occurred while liking the post",
                });
            }
        });
    }
    unlike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.id;
            try {
                // בדיקה אם המשתמש מחובר
                if (!req.user) {
                    res.status(401).json({ message: "Unauthorized: User not logged in" });
                    return;
                }
                const userId = req.user._id;
                // שליפת הפוסט לפי ID
                const post = yield post_model_1.default.findById(postId).select("usersWhoLiked");
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }
                // בדיקה אם המשתמש עשה לייק
                const alreadyLiked = post.usersWhoLiked.some((id) => id.toString() === userId);
                if (!alreadyLiked) {
                    res.status(400).json({ message: "User has not liked this post" });
                    return;
                }
                // הסרת המשתמש ממערך הלייקים
                post.usersWhoLiked = post.usersWhoLiked.filter((id) => id.toString() !== userId);
                // שמירה של הפוסט המעודכן
                yield post.save();
                res.status(200).json({ message: "Post unliked successfully", post });
            }
            catch (error) {
                console.error("Error in unlike function:", error);
                res.status(500).json({
                    message: "An error occurred while unliking the post",
                    error: error.message,
                });
            }
        });
    }
    addComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log(req);
            try {
                if (!req.body.text || !req.user) {
                    res.status(400).json({ message: "Missing required fields." });
                    return;
                }
                const postId = req.params.id;
                const comment = { text: req.body.text, user: req.user._id };
                // עדכון הפוסט עם הוספת התגובה
                const updatedPost = yield this.model
                    .findByIdAndUpdate(postId, { $push: { comments: comment } }, { new: true })
                    .populate("comments.user", "username image"); // לוודא שהמשתמש נטען עם התגובה
                if (!updatedPost) {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }
                const newComment = (_b = (_a = updatedPost.comments) === null || _a === void 0 ? void 0 : _a[updatedPost.comments.length - 1]) !== null && _b !== void 0 ? _b : null;
                if (!newComment) {
                    res.status(500).json({ message: "Failed to retrieve new comment." });
                    return;
                }
                res.status(201).json(newComment);
            }
            catch (error) {
                console.error("Error adding comment:", error);
                res.status(500).json({ message: "Failed to add comment." });
            }
        });
    }
    getMyPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(401).send({ message: "Unauthorized" });
                    return;
                }
                const posts = yield post_model_1.default.find({ owner: req.user._id });
                res.status(200).json(posts);
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
    }
    updatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("update");
            const postId = req.params.id;
            try {
                if (!req.user) {
                    res.status(401).send({ message: "Unauthorized" });
                    return;
                }
                const post = yield post_model_1.default
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
                if (title)
                    post.title = title;
                if (content)
                    post.content = content;
                if (req.file) {
                    if (post.imageUrl) {
                        const oldImagePath = path_1.default.join(__dirname, "..", post.imageUrl);
                        console.log("🔹 Trying to delete:", oldImagePath);
                        try {
                            if (fs_1.default.existsSync(oldImagePath)) {
                                fs_1.default.unlinkSync(oldImagePath);
                                console.log("✅ File deleted successfully");
                            }
                            else {
                                console.log("⚠️ File not found:", oldImagePath);
                            }
                        }
                        catch (error) {
                            console.error("❌ Error deleting file:", error);
                        }
                    }
                    const targetDir = path_1.default.join(__dirname, "../uploads/posts");
                    if (!fs_1.default.existsSync(targetDir)) {
                        fs_1.default.mkdirSync(targetDir, { recursive: true });
                    }
                    const imageName = new Date().toISOString().replace(/[:.]/g, "-");
                    const targetPath = path_1.default.join(targetDir, `${imageName}.png`);
                    fs_1.default.renameSync(req.file.path, targetPath);
                    post.imageUrl = `/uploads/posts/${imageName}.png`;
                }
                yield post.save();
                res.status(200).json(post);
            }
            catch (err) {
                res.status(500).send({ message: err.message });
            }
        });
    }
}
function fetchBookCoverFromGoogleBooks(title, postId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const query = encodeURIComponent(`${title}`);
        const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
        const openLibraryUrl = `https://openlibrary.org/search.json?title=${query}`;
        try {
            // Try Google Books API first
            const googleResponse = yield axios_1.default.get(googleApiUrl);
            const googleData = googleResponse.data;
            if (googleData.items && googleData.items.length > 0) {
                const book = googleData.items[0].volumeInfo;
                const imageUrl = ((_a = book.imageLinks) === null || _a === void 0 ? void 0 : _a.thumbnail) ||
                    ((_b = book.imageLinks) === null || _b === void 0 ? void 0 : _b.smallThumbnail) ||
                    getRandomImage();
                // const imageUrl = book.imageLinks?.thumbnail || getRandomImage();
                return yield saveImageFromUrl(imageUrl, postId);
            }
        }
        catch (error) {
            console.error("Google Books API failed. Trying Open Library API...");
        }
        try {
            // Fallback: Try Open Library API
            const openLibraryResponse = yield axios_1.default.get(openLibraryUrl);
            const openLibraryData = openLibraryResponse.data;
            if (openLibraryData.docs && openLibraryData.docs.length > 0) {
                const coverId = openLibraryData.docs[0].cover_i;
                if (coverId) {
                    const imageUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
                    return yield saveImageFromUrl(imageUrl, postId);
                }
            }
        }
        catch (error) {
            console.error("Open Library API also failed.");
        }
        console.log("Both APIs failed. Using fallback image.");
        return getRandomImage();
    });
}
// Function to download and save image
function saveImageFromUrl(imageUrl, postId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!imageUrl.startsWith("http")) {
                throw new Error(`Invalid image URL: ${imageUrl}`);
            }
            const response = yield axios_1.default.get(imageUrl, { responseType: "arraybuffer" });
            const targetDir = path_1.default.join(__dirname, "../uploads/posts"); // Ensure correct path
            if (!fs_1.default.existsSync(targetDir)) {
                fs_1.default.mkdirSync(targetDir, { recursive: true });
            }
            const imagePath = path_1.default.join(targetDir, `${postId}.png`);
            // Resize and optimize image using sharp
            yield (0, sharp_1.default)(Buffer.from(response.data))
                .resize(500, 750, { fit: "cover" }) // Resize to 500x750px while maintaining aspect ratio
                .jpeg({ quality: 80 }) // Convert to JPEG and reduce quality to 80%
                .toFile(imagePath);
            console.log(`Image optimized and saved at: ${imagePath}`);
            return `/uploads/posts/${postId}.png`;
        }
        catch (error) {
            console.error("Error saving image:", error);
            return getRandomImage(); // Return a fallback image if saving fails
        }
    });
}
function getRandomImage() {
    return "/uploads/posts/DefaultBook.png"; // Path to your stored default image
}
exports.default = new PostsController();
//# sourceMappingURL=post_controller.js.map