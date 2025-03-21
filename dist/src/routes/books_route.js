"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const book_recommendation_controller_1 = require("../controllers/book_recommendation_controller");
const router = express_1.default.Router();
/**
* @swagger
* tags:
*   name: Books
*   description: The Authentication API
*/
/**
 * @swagger
 * /books/recommend:
 *   post:
 *     summary: Get AI-based book recommendations
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookTitle:
 *                 type: string
 *                 example: "Harry Potter"
 *     responses:
 *       200:
 *         description: A list of recommended books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Missing book title
 *       500:
 *         description: Internal server error
 */
router.post("/recommend", book_recommendation_controller_1.recommendBooks);
exports.default = router;
//# sourceMappingURL=books_route.js.map