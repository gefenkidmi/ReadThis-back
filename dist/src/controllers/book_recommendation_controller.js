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
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendBooks = void 0;
const books_service_1 = require("../services/books_service");
const recommendBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookTitle } = req.body;
        if (!bookTitle) {
            res.status(400).json({ error: "Book title is required." });
        }
        const recommendations = yield (0, books_service_1.getBookRecommendations)(bookTitle);
        if (!recommendations.length) {
            res.status(404).json({ message: "No similar books found." });
        }
        res.json({ recommendations });
    }
    catch (error) {
        console.error("❌ Error fetching book recommendations:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.recommendBooks = recommendBooks;
//# sourceMappingURL=book_recommendation_controller.js.map