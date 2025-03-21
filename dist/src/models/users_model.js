"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: "../uploads/profile/testing.png"
    },
    refreshToken: {
        type: [String],
        default: [],
    },
});
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
//# sourceMappingURL=users_model.js.map