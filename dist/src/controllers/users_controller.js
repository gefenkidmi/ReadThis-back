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
exports.updateProfile = void 0;
const users_model_1 = __importDefault(require("../models/users_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            res.status(400).json({ message: "All fields are required: email, username, password." });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Invalid email format." });
            return;
        }
        // Check if a user with the same email or username already exists
        const existingUser = yield users_model_1.default.findOne({
            $or: [{ email }, { username }],
        });
        if (!req.file) {
            res.status(400).json({ message: "Profile image is required." });
            return;
        }
        if (existingUser) {
            res.status(400).json({
                message: "Username or Email already exists. Please try a different one.",
            });
            return;
        }
        // Hash the password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Create the user first (without the imageUrl)
        const user = yield users_model_1.default.create({
            email,
            username,
            password: hashedPassword,
            imageUrl: "", // Temporarily empty
        });
        const targetDir = path_1.default.join(__dirname, "../uploads/profile");
        if (!fs_1.default.existsSync(targetDir)) {
            fs_1.default.mkdirSync(targetDir, { recursive: true });
        }
        // Now rename the image to use the user's ID as filename
        const targetPath = path_1.default.join(targetDir, `${user._id}.png`);
        fs_1.default.renameSync(req.file.path, targetPath);
        // Update the imageUrl with the correct path
        user.imageUrl = `/uploads/profile/${user._id}.png`;
        yield user.save();
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const generateToken = (userId) => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const accessToken = jsonwebtoken_1.default.sign({ _id: userId, random }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRES });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: userId, random }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });
    return { accessToken, refreshToken };
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Find the user by username
        const user = yield users_model_1.default.findOne({ username });
        if (!user) {
            res.status(400).send("User not found");
            return;
        }
        // Check the password
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).send("Wrong username or password");
            return;
        }
        // Generate tokens
        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send("Server Error");
            return;
        }
        // Update refresh tokens
        user.refreshToken = [...(user.refreshToken || []), tokens.refreshToken];
        yield user.save();
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            res.status(400).send("Refresh token is required");
            return;
        }
        // Find the user and remove the refresh token
        const user = yield users_model_1.default.findOne({ refreshToken });
        if (user) {
            user.refreshToken = ((_a = user.refreshToken) === null || _a === void 0 ? void 0 : _a.filter((token) => token !== refreshToken)) || [];
            yield user.save();
        }
        res.status(200).send("Success");
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            res.status(400).send("Refresh token is required");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send("Server Error");
            return;
        }
        // Verify the refresh token
        jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (err) {
                res.status(401).send("Invalid refresh token");
                return;
            }
            const userId = payload._id;
            const user = yield users_model_1.default.findById(userId);
            if (!user || !((_a = user.refreshToken) === null || _a === void 0 ? void 0 : _a.includes(refreshToken))) {
                res.status(401).send("Invalid refresh token");
                return;
            }
            // Generate new tokens
            const tokens = generateToken(user._id);
            if (!tokens) {
                res.status(500).send("Server Error");
                return;
            }
            // Update refresh tokens
            user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
            user.refreshToken.push(tokens.refreshToken);
            yield user.save();
            res.status(200).send({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id,
            });
        }));
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const getMyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).send("Unauthorized: No user ID provided.");
            return;
        }
        const user = yield users_model_1.default.findById(userId).select("-password -refreshToken");
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).send({ message: "Server Error", error });
    }
});
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).send("Unauthorized");
            return;
        }
        const updateData = { username: req.body.username };
        if (req.file) {
            const targetDir = path_1.default.join(__dirname, "../uploads/profile");
            if (!fs_1.default.existsSync(targetDir)) {
                fs_1.default.mkdirSync(targetDir, { recursive: true });
            }
            const imageUrl = `/uploads/profile/${userId}.png`;
            fs_1.default.renameSync(req.file.path, path_1.default.join(targetDir, `${userId}.png`));
            updateData.imageUrl = imageUrl;
        }
        const user = yield users_model_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).send(user);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.updateProfile = updateProfile;
exports.default = {
    register,
    login,
    refresh,
    logout,
    getMyProfile,
    updateProfile: exports.updateProfile,
    generateToken
};
//# sourceMappingURL=users_controller.js.map