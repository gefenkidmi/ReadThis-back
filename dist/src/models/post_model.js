"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    content: String,
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    imageUrl: {
        type: String,
    },
    usersWhoLiked: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: {
        type: [
            {
                user: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: "User",
                },
                text: String,
            },
        ],
        default: [], // 👈 הוספת ברירת מחדל למערך ריק
    },
}, { timestamps: true });
const postModel = mongoose_1.default.model("Posts", postSchema);
exports.default = postModel;
//# sourceMappingURL=post_model.js.map