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
exports.getBookRecommendations = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const AI_ML_API_URL = "https://api.aimlapi.com/v1/chat/completions"; // API/ML chat URL
const AI_ML_API_KEY = process.env.OPENAI_API_KEY; // API key from .env file
const getBookRecommendations = (bookTitle) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!AI_ML_API_KEY) {
            throw new Error("AI/ML API key is missing.");
        }
        const response = yield axios_1.default.post(AI_ML_API_URL, {
            model: "gpt-4o-mini", // Replace if AI/ML API has a specific model
            messages: [
                { role: "system", content: "You are a helpful AI assistant that recommends books." },
                { role: "user", content: `Can you find for me 5-10 books in the same genre as ${bookTitle}? Provide book name, author, and a short description for each.` }
            ],
            max_tokens: 300,
        }, {
            headers: {
                Authorization: `Bearer ${AI_ML_API_KEY}`,
                "Content-Type": "application/json",
            },
        });
        // Extract the text response
        const responseText = (_c = (_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim();
        if (!responseText) {
            return ["No recommendations found."];
        }
        // Splitting response into a list format (assuming AI returns numbered books)
        return responseText.split("\n").filter(line => line.trim() !== "");
    }
    catch (error) {
        console.error("❌ Error fetching book recommendations:", error);
        return ["No recommendations found."];
    }
});
exports.getBookRecommendations = getBookRecommendations;
//# sourceMappingURL=books_service.js.map