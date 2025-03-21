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
const users_model_1 = __importDefault(require("../models/users_model"));
// Ensure correct function signature for Express request handler
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: "No token provided" });
            return;
        }
        // Verify Google Token
        const decodedToken = yield fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
            .then((res) => res.json());
        if (!decodedToken.email) {
            res.status(401).json({ error: "Invalid Google token" });
            return;
        }
        // Check if user exists
        let user = yield users_model_1.default.findOne({ email: decodedToken.email });
        if (!user) {
            user = yield users_model_1.default.create({
                email: decodedToken.email,
                password: "", // No password for Google users
            });
        }
        res.status(200).json({ message: "Google login successful", user });
    }
    catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Ensure default export
exports.default = {
    googleLogin,
};
//# sourceMappingURL=authController.js.map