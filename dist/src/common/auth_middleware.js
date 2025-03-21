"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authorization = req.header("Authorization");
    if (!authorization) {
        console.log(" No token provided");
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    const token = authorization.split(" ")[1]; // חילוץ ה-token
    console.log(token);
    if (!token) {
        console.log("invalid token");
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err || !decoded) {
            console.log(err);
            res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
            return;
        }
        // Ensure decoded is treated as a JWT payload
        const userPayload = decoded;
        req.user = {
            _id: userPayload._id, // Ensure _id is a string
            email: userPayload.email,
            username: userPayload.username,
            imageUrl: userPayload.imageUrl,
            password: "", // Optional: Use an empty string or remove if not needed
        };
        next();
    });
};
exports.default = authMiddleware;
//# sourceMappingURL=auth_middleware.js.map